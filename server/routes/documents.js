import { Router } from 'express';
import {
  loadPipeline,
  savePipeline,
  loadDocument,
  saveDocument,
  loadDocParts,
  loadRationale,
  saveRationale,
  resetPipeline,
  loadObjects,
  loadGraph,
} from '../services/storage.js';
import {
  generatePlanOfPlan,
  parsePlanOfPlan,
  generateRationaleContent,
  generatePlan,
  generateGenPlan,
  generateDocPart,
  assembleFinal,
} from '../services/pipeline.js';

export const documentsRouter = Router();

// Get pipeline state
documentsRouter.get('/pipeline', async (req, res) => {
  try {
    const pipeline = await loadPipeline();
    res.json(pipeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a document's content
documentsRouter.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    if (name === 'doc-parts') {
      const parts = await loadDocParts();
      return res.json({ parts });
    }
    // Rationale docs use slug prefix
    if (name.startsWith('rationale:')) {
      const slug = name.replace('rationale:', '');
      const content = await loadRationale(slug);
      return res.json({ content: content || '' });
    }
    const content = await loadDocument(name);
    if (content === null) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save edited document content
documentsRouter.put('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { content } = req.body;
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'content is required' });
    }
    if (name.startsWith('rationale:')) {
      const slug = name.replace('rationale:', '');
      await saveRationale(slug, content);
      // Update status to draft if it was empty
      const pipeline = await loadPipeline();
      if (pipeline.documents[name] && pipeline.documents[name].status === 'empty') {
        pipeline.documents[name].status = 'draft';
        await savePipeline(pipeline);
      }
    } else {
      await saveDocument(name, content);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get graph objects with connections (for ObjectPicker)
documentsRouter.get('/objects/list', async (req, res) => {
  try {
    const objects = await loadObjects();
    const graph = await loadGraph();
    const edges = graph.edges || [];

    // Attach connections to each object
    const enriched = objects.map(obj => {
      const connections = edges
        .filter(e => e.source === obj.id || e.target === obj.id)
        .map(e => {
          const isSource = e.source === obj.id;
          const otherId = isSource ? e.target : e.source;
          const other = objects.find(o => o.id === otherId);
          return {
            direction: isSource ? 'outgoing' : 'incoming',
            label: e.label || '',
            otherLabel: other ? other.label : otherId,
            otherType: other ? other.type : 'unknown',
          };
        });
      return {
        id: obj.id,
        label: obj.label,
        type: obj.type,
        summary: obj.summary || '',
        connections,
      };
    });

    res.json({ objects: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve a document — marks as approved, advances pipeline
documentsRouter.post('/approve/:docKey', async (req, res) => {
  try {
    const { docKey } = req.params;
    const pipeline = await loadPipeline();

    if (!pipeline.documents[docKey]) {
      return res.status(400).json({ error: `Unknown document: ${docKey}` });
    }

    const doc = pipeline.documents[docKey];
    if (doc.status === 'locked') {
      return res.status(400).json({ error: 'Cannot approve a locked document' });
    }

    // Mark as approved
    doc.status = 'approved';

    // Handle stage transitions
    if (docKey === 'plan-of-plan') {
      // Parse rationale docs from plan-of-plan content
      const content = await loadDocument('plan-of-plan');
      const rationaleDocs = parsePlanOfPlan(content || '');

      if (rationaleDocs.length > 0) {
        // Add rationale doc entries to pipeline
        for (const rd of rationaleDocs) {
          const key = `rationale:${rd.slug}`;
          pipeline.documents[key] = {
            status: 'empty',
            path: `rationale/${rd.slug}.md`,
            label: rd.label,
            description: rd.description,
          };
        }
        // Add downstream docs as locked
        pipeline.documents['plan'] = { status: 'locked', label: 'Plan' };
        pipeline.documents['generation-plan'] = { status: 'locked', label: 'Generation Plan' };
        pipeline.documents['final'] = { status: 'locked', label: 'Final' };
        pipeline.stage = 'rationale';
      }
    } else if (docKey.startsWith('rationale:')) {
      // Check if ALL rationale docs are now approved
      const rationaleKeys = Object.keys(pipeline.documents).filter(k => k.startsWith('rationale:'));
      const allApproved = rationaleKeys.every(k => pipeline.documents[k].status === 'approved');
      if (allApproved) {
        // Unlock plan
        pipeline.documents['plan'].status = 'empty';
        pipeline.stage = 'plan';
      }
    } else if (docKey === 'plan') {
      pipeline.documents['generation-plan'].status = 'empty';
      pipeline.stage = 'generation-plan';
    } else if (docKey === 'generation-plan') {
      pipeline.stage = 'doc-parts';
    } else if (docKey === 'final') {
      pipeline.stage = 'complete';
    }

    await savePipeline(pipeline);
    res.json(pipeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger generation of a pipeline step
documentsRouter.post('/generate/:step', async (req, res) => {
  try {
    const step = req.params.step;
    const pipeline = await loadPipeline();

    // Validate step exists in pipeline (or is a special case like doc-parts)
    const isDocPart = step.startsWith('doc-part-');
    if (!isDocPart && !pipeline.documents[step]) {
      return res.status(400).json({ error: `Unknown step: ${step}` });
    }

    // Mark as generating
    if (!isDocPart) {
      pipeline.documents[step].status = 'generating';
    }
    pipeline.error = null;
    await savePipeline(pipeline);

    try {
      let result;

      if (step === 'plan-of-plan') {
        result = await generatePlanOfPlan();
      } else if (step.startsWith('rationale:')) {
        const slug = step.replace('rationale:', '');
        result = await generateRationaleContent(slug);
      } else if (step === 'plan') {
        result = await generatePlan();
      } else if (step === 'generation-plan') {
        result = await generateGenPlan();
      } else if (isDocPart) {
        const partIndex = parseInt(step.replace('doc-part-', ''));
        result = await generateDocPart(partIndex);
      } else if (step === 'final') {
        result = await assembleFinal();
      } else {
        throw new Error(`No generator for step: ${step}`);
      }

      // Mark as ready
      const updated = await loadPipeline();
      if (!isDocPart && updated.documents[step]) {
        updated.documents[step].status = 'ready';
      }
      await savePipeline(updated);
      res.json(updated);
    } catch (genErr) {
      const errPipeline = await loadPipeline();
      errPipeline.error = genErr.message;
      if (!isDocPart && errPipeline.documents[step]) {
        // Revert to previous status
        errPipeline.documents[step].status = 'empty';
      }
      await savePipeline(errPipeline);
      res.status(500).json({ error: genErr.message, pipeline: errPipeline });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset pipeline
documentsRouter.post('/reset', async (req, res) => {
  try {
    await resetPipeline();
    const pipeline = await loadPipeline();
    res.json(pipeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
