import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface AssetInfo {
  url: string;
  exists: boolean;
  size?: number;
}

interface DiagResult {
  runtime: 'cubism4' | 'cubism2' | 'unknown';
  entryFile: string;
  entryUrl: string;
  assets: AssetInfo[];
  notes: string[];
  sdkAvailable: boolean;
}

export async function GET() {
  const publicDir = path.join(process.cwd(), 'public');
  const modelDir = path.join(publicDir, 'glorpi_cat');
  const sdkPath = path.join(publicDir, 'live2d', 'live2dcubismcore.min.js');
  
  const result: DiagResult = {
    runtime: 'unknown',
    entryFile: '',
    entryUrl: '',
    assets: [],
    notes: [],
    sdkAvailable: false,
  };

  // Check SDK availability
  try {
    const stat = fs.statSync(sdkPath);
    result.sdkAvailable = stat.isFile() && stat.size > 0;
    if (result.sdkAvailable) {
      result.notes.push(`SDK found: ${stat.size} bytes`);
    }
  } catch {
    result.notes.push('SDK not found at /public/live2d/live2dcubismcore.min.js');
  }

  // Check if model directory exists
  if (!fs.existsSync(modelDir)) {
    result.notes.push('Model directory /public/glorpi_cat does not exist');
    return NextResponse.json(result);
  }

  // Scan for entry files
  const files = fs.readdirSync(modelDir);
  
  // Prioritize Cubism 4
  const model3Files = files.filter(f => f.endsWith('.model3.json'));
  const modelFiles = files.filter(f => f === 'model.json');
  const moc3Files = files.filter(f => f.endsWith('.moc3'));
  const mocFiles = files.filter(f => f.endsWith('.moc') && !f.endsWith('.moc3'));

  // Determine runtime
  if (model3Files.length > 0 && moc3Files.length > 0) {
    result.runtime = 'cubism4';
    result.entryFile = model3Files[0];
    result.notes.push(`Found Cubism 4 model: ${model3Files[0]}`);
  } else if (modelFiles.length > 0 && mocFiles.length > 0) {
    result.runtime = 'cubism2';
    result.entryFile = modelFiles[0];
    result.notes.push(`Found Cubism 2 model: ${modelFiles[0]}`);
  } else {
    result.notes.push('Could not determine model type');
    result.notes.push(`Files found: ${files.slice(0, 10).join(', ')}`);
    return NextResponse.json(result);
  }

  result.entryUrl = `/glorpi_cat/${result.entryFile}`;

  // Parse entry JSON to get referenced assets
  try {
    const entryPath = path.join(modelDir, result.entryFile);
    const entryContent = fs.readFileSync(entryPath, 'utf-8');
    const modelJson = JSON.parse(entryContent);

    // Check entry file itself
    const entryStat = fs.statSync(entryPath);
    result.assets.push({
      url: result.entryUrl,
      exists: true,
      size: entryStat.size,
    });

    // Extract references based on runtime
    if (result.runtime === 'cubism4') {
      const refs = modelJson.FileReferences || {};
      
      // Moc3
      if (refs.Moc) {
        const mocPath = path.join(modelDir, refs.Moc);
        const exists = fs.existsSync(mocPath);
        let size: number | undefined;
        if (exists) {
          size = fs.statSync(mocPath).size;
        }
        result.assets.push({ url: `/glorpi_cat/${refs.Moc}`, exists, size });
      }

      // Textures
      if (refs.Textures && Array.isArray(refs.Textures)) {
        for (const tex of refs.Textures) {
          const texPath = path.join(modelDir, tex);
          const exists = fs.existsSync(texPath);
          let size: number | undefined;
          if (exists) {
            size = fs.statSync(texPath).size;
          }
          result.assets.push({ url: `/glorpi_cat/${tex}`, exists, size });
        }
      }

      // Physics
      if (refs.Physics) {
        const physPath = path.join(modelDir, refs.Physics);
        const exists = fs.existsSync(physPath);
        let size: number | undefined;
        if (exists) {
          size = fs.statSync(physPath).size;
        }
        result.assets.push({ url: `/glorpi_cat/${refs.Physics}`, exists, size });
      }

      // DisplayInfo
      if (refs.DisplayInfo) {
        const cdiPath = path.join(modelDir, refs.DisplayInfo);
        const exists = fs.existsSync(cdiPath);
        let size: number | undefined;
        if (exists) {
          size = fs.statSync(cdiPath).size;
        }
        result.assets.push({ url: `/glorpi_cat/${refs.DisplayInfo}`, exists, size });
      }

      // Expressions
      if (refs.Expressions && Array.isArray(refs.Expressions)) {
        result.notes.push(`Expressions defined: ${refs.Expressions.length}`);
        for (const exp of refs.Expressions) {
          const expFile = typeof exp === 'string' ? exp : exp.File;
          const expName = typeof exp === 'string' ? exp : exp.Name;
          if (expFile) {
            const expPath = path.join(modelDir, expFile);
            const exists = fs.existsSync(expPath);
            let size: number | undefined;
            if (exists) {
              size = fs.statSync(expPath).size;
            }
            result.assets.push({ 
              url: `/glorpi_cat/${expFile}`, 
              exists, 
              size,
            });
            if (exists) {
              result.notes.push(`Expression "${expName}" found: ${expFile}`);
            } else {
              result.notes.push(`Expression "${expName}" MISSING: ${expFile}`);
            }
          }
        }
      } else {
        result.notes.push('No expressions defined in model3.json');
      }

      // Motions
      if (refs.Motions) {
        const motionGroups = Object.values(refs.Motions) as any[];
        for (const group of motionGroups.slice(0, 2)) {
          if (Array.isArray(group)) {
            for (const motion of group.slice(0, 2)) {
              const motionFile = motion.File;
              if (motionFile) {
                const motionPath = path.join(modelDir, motionFile);
                const exists = fs.existsSync(motionPath);
                result.assets.push({ url: `/glorpi_cat/${motionFile}`, exists });
              }
            }
          }
        }
      }
    } else if (result.runtime === 'cubism2') {
      // Cubism 2 structure
      if (modelJson.model) {
        const mocPath = path.join(modelDir, modelJson.model);
        const exists = fs.existsSync(mocPath);
        result.assets.push({ url: `/glorpi_cat/${modelJson.model}`, exists });
      }
      if (modelJson.textures && Array.isArray(modelJson.textures)) {
        for (const tex of modelJson.textures) {
          const texPath = path.join(modelDir, tex);
          const exists = fs.existsSync(texPath);
          result.assets.push({ url: `/glorpi_cat/${tex}`, exists });
        }
      }
    }

    // Check for missing assets
    const missing = result.assets.filter(a => !a.exists);
    if (missing.length > 0) {
      result.notes.push(`Missing ${missing.length} asset(s): ${missing.map(a => a.url).join(', ')}`);
    } else {
      result.notes.push('All referenced assets exist');
    }

  } catch (err) {
    result.notes.push(`Failed to parse entry JSON: ${err instanceof Error ? err.message : String(err)}`);
  }

  return NextResponse.json(result);
}
