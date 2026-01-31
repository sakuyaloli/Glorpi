import { get, set, del, keys, clear } from 'idb-keyval';
import type { Project, ProjectSnapshot, PromptBlock, ModelKnobs } from './types';
import { v4 as uuid } from 'uuid';

// ==========================================
// IndexedDB Storage Layer
// ==========================================

const PROJECTS_PREFIX = 'project_';
const SETTINGS_KEY = 'glorpi_settings';

export interface GlorpiSettings {
  defaultProvider: string;
  defaultModel: string;
  enabledProviders: string[];
  theme: 'light' | 'dark' | 'system';
  companionPosition: 'left' | 'right';
  showTokenEstimates: boolean;
  autoSave: boolean;
}

const defaultSettings: GlorpiSettings = {
  defaultProvider: 'anthropic',
  defaultModel: 'claude-sonnet-4-20250514',
  enabledProviders: ['anthropic', 'openai', 'gemini', 'deepseek'],
  theme: 'light',
  companionPosition: 'right',
  showTokenEstimates: true,
  autoSave: true,
};

// Project CRUD operations
export async function createProject(name: string, blocks: PromptBlock[] = []): Promise<Project> {
  const project: Project = {
    id: uuid(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks,
    selectedProvider: 'anthropic',
    selectedModel: 'claude-sonnet-4-20250514',
    knobs: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
    snapshots: [],
  };

  await set(`${PROJECTS_PREFIX}${project.id}`, project);
  return project;
}

export async function getProject(id: string): Promise<Project | undefined> {
  return get(`${PROJECTS_PREFIX}${id}`);
}

export async function updateProject(project: Project): Promise<void> {
  project.updatedAt = new Date().toISOString();
  await set(`${PROJECTS_PREFIX}${project.id}`, project);
}

export async function deleteProject(id: string): Promise<void> {
  await del(`${PROJECTS_PREFIX}${id}`);
}

export async function listProjects(): Promise<Project[]> {
  const allKeys = await keys();
  const projectKeys = allKeys.filter(
    (key) => typeof key === 'string' && key.startsWith(PROJECTS_PREFIX)
  );

  const projects: Project[] = [];
  for (const key of projectKeys) {
    const project = await get(key as string);
    if (project) {
      projects.push(project as Project);
    }
  }

  return projects.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

// Snapshot operations
export async function createSnapshot(
  projectId: string,
  name: string
): Promise<ProjectSnapshot | undefined> {
  const project = await getProject(projectId);
  if (!project) return undefined;

  const snapshot: ProjectSnapshot = {
    id: uuid(),
    name,
    createdAt: new Date().toISOString(),
    blocks: JSON.parse(JSON.stringify(project.blocks)),
    knobs: JSON.parse(JSON.stringify(project.knobs)),
  };

  project.snapshots.push(snapshot);
  await updateProject(project);

  return snapshot;
}

export async function restoreSnapshot(
  projectId: string,
  snapshotId: string
): Promise<Project | undefined> {
  const project = await getProject(projectId);
  if (!project) return undefined;

  const snapshot = project.snapshots.find((s) => s.id === snapshotId);
  if (!snapshot) return undefined;

  project.blocks = JSON.parse(JSON.stringify(snapshot.blocks));
  project.knobs = JSON.parse(JSON.stringify(snapshot.knobs));
  await updateProject(project);

  return project;
}

export async function deleteSnapshot(projectId: string, snapshotId: string): Promise<void> {
  const project = await getProject(projectId);
  if (!project) return;

  project.snapshots = project.snapshots.filter((s) => s.id !== snapshotId);
  await updateProject(project);
}

// Block operations
export function createBlock(
  type: PromptBlock['type'],
  title: string,
  content: string = ''
): PromptBlock {
  return {
    id: uuid(),
    type,
    title,
    content,
    enabled: true,
    locked: false,
    collapsed: false,
  };
}

// Settings operations
export async function getSettings(): Promise<GlorpiSettings> {
  const settings = await get(SETTINGS_KEY);
  return { ...defaultSettings, ...(settings as Partial<GlorpiSettings>) };
}

export async function updateSettings(settings: Partial<GlorpiSettings>): Promise<GlorpiSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await set(SETTINGS_KEY, updated);
  return updated;
}

// Clear all data
export async function clearAllData(): Promise<void> {
  await clear();
}

// Export/Import
export async function exportAllData(): Promise<{
  projects: Project[];
  settings: GlorpiSettings;
}> {
  const projects = await listProjects();
  const settings = await getSettings();
  return { projects, settings };
}

export async function importData(data: {
  projects: Project[];
  settings: GlorpiSettings;
}): Promise<void> {
  await clear();
  await set(SETTINGS_KEY, data.settings);
  for (const project of data.projects) {
    await set(`${PROJECTS_PREFIX}${project.id}`, project);
  }
}
