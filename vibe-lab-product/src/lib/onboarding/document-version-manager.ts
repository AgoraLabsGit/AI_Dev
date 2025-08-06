/**
 * Document Version Manager
 * Handles versioning, change tracking, and Single Source of Truth for AVCA documents
 */

import { FlexibleObject } from '@/types/development-friendly';

export interface DocumentVersion {
  id: string;
  version: number;
  timestamp: Date;
  changes: DocumentChange[];
  reason: string;
  userId: string;
  aiConfidence?: number;
}

export interface DocumentChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
  aiReasoning?: string;
}

export interface VersionedDocument {
  currentVersion: number;
  document: FlexibleObject;
  versions: DocumentVersion[];
  lastModified: Date;
  changeHistory: DocumentChange[];
}

export interface DocumentUpdateContext {
  userMessage: string;
  conversationHistory: Array<{ role: string; content: string; timestamp: string }>;
  extractedInfo: FlexibleObject;
  updateReasons: string[];
  aiConfidence: number;
  userId: string;
}

export class DocumentVersionManager {
  /**
   * Create a new versioned document
   */
  static createVersionedDocument(
    initialDocument: FlexibleObject,
    userId: string,
    reason: string = "Initial creation"
  ): VersionedDocument {
    const now = new Date();
    const initialVersion: DocumentVersion = {
      id: this.generateVersionId(),
      version: 1,
      timestamp: now,
      changes: [],
      reason,
      userId,
      aiConfidence: 100
    };

    return {
      currentVersion: 1,
      document: initialDocument,
      versions: [initialVersion],
      lastModified: now,
      changeHistory: []
    };
  }

  /**
   * Update a document with change tracking
   */
  static updateDocument(
    versionedDoc: VersionedDocument,
    updates: FlexibleObject,
    context: DocumentUpdateContext
  ): VersionedDocument {
    const changes = this.calculateChanges(versionedDoc.document, updates);
    
    if (changes.length === 0) {
      return versionedDoc; // No changes needed
    }

    const newVersion = versionedDoc.currentVersion + 1;
    const now = new Date();

    // Apply updates to document
    const updatedDocument = this.applyUpdates(versionedDoc.document, updates);

    // Create new version entry
    const newVersionEntry: DocumentVersion = {
      id: this.generateVersionId(),
      version: newVersion,
      timestamp: now,
      changes,
      reason: context.updateReasons.join(', '),
      userId: context.userId,
      aiConfidence: context.aiConfidence
    };

    return {
      currentVersion: newVersion,
      document: updatedDocument,
      versions: [...versionedDoc.versions, newVersionEntry],
      lastModified: now,
      changeHistory: [...versionedDoc.changeHistory, ...changes]
    };
  }

  /**
   * Calculate changes between old and new document
   */
  private static calculateChanges(
    oldDoc: FlexibleObject,
    newDoc: FlexibleObject,
    prefix = ''
  ): DocumentChange[] {
    const changes: DocumentChange[] = [];

    // Check for additions and modifications
    for (const [key, newValue] of Object.entries(newDoc)) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      const oldValue = oldDoc[key];

      if (oldValue === undefined) {
        changes.push({
          field: fieldPath,
          oldValue: undefined,
          newValue,
          changeType: 'added'
        });
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        if (typeof newValue === 'object' && typeof oldValue === 'object' && 
            newValue !== null && oldValue !== null) {
          // Recursively check nested objects
          changes.push(...this.calculateChanges(oldValue, newValue, fieldPath));
        } else {
          changes.push({
            field: fieldPath,
            oldValue,
            newValue,
            changeType: 'modified'
          });
        }
      }
    }

    // Check for removals
    for (const [key, oldValue] of Object.entries(oldDoc)) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      if (!(key in newDoc)) {
        changes.push({
          field: fieldPath,
          oldValue,
          newValue: undefined,
          changeType: 'removed'
        });
      }
    }

    return changes;
  }

  /**
   * Apply updates to document (deep merge)
   */
  private static applyUpdates(
    original: FlexibleObject,
    updates: FlexibleObject
  ): FlexibleObject {
    const result = { ...original };

    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value) &&
          typeof original[key] === 'object' && original[key] !== null) {
        // Recursively merge objects
        result[key] = this.applyUpdates(original[key], value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Get document at specific version
   */
  static getDocumentAtVersion(
    versionedDoc: VersionedDocument,
    version: number
  ): FlexibleObject | null {
    if (version === versionedDoc.currentVersion) {
      return versionedDoc.document;
    }

    // For now, we only support current version
    // In a full implementation, we'd reconstruct from changes
    return null;
  }

  /**
   * Get change summary for UI display
   */
  static getChangeSummary(changes: DocumentChange[]): string {
    if (changes.length === 0) return "No changes";

    const summary = [];
    const addedCount = changes.filter(c => c.changeType === 'added').length;
    const modifiedCount = changes.filter(c => c.changeType === 'modified').length;
    const removedCount = changes.filter(c => c.changeType === 'removed').length;

    if (addedCount > 0) summary.push(`${addedCount} added`);
    if (modifiedCount > 0) summary.push(`${modifiedCount} modified`);
    if (removedCount > 0) summary.push(`${removedCount} removed`);

    return summary.join(', ');
  }

  /**
   * Generate unique version ID
   */
  private static generateVersionId(): string {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate document structure
   */
  static validateDocument(doc: FlexibleObject, type: 'projectOverview' | 'buildSpecifications'): {
    isValid: boolean;
    errors: string[];
    completeness: number;
  } {
    const errors: string[] = [];
    let requiredFields: string[] = [];
    let presentFields = 0;

    if (type === 'projectOverview') {
      requiredFields = ['name', 'description', 'targetUsers', 'keyFeatures', 'problemSolved'];
    } else if (type === 'buildSpecifications') {
      requiredFields = ['architecture', 'techStack', 'coreComponents'];
    }

    for (const field of requiredFields) {
      if (doc[field] && doc[field] !== '' && doc[field] !== null) {
        presentFields++;
      } else {
        errors.push(`Missing required field: ${field}`);
      }
    }

    const completeness = Math.round((presentFields / requiredFields.length) * 100);

    return {
      isValid: errors.length === 0,
      errors,
      completeness
    };
  }

  /**
   * Merge multiple document updates intelligently
   */
  static mergeUpdates(updates: FlexibleObject[]): FlexibleObject {
    return updates.reduce((merged, update) => {
      return this.applyUpdates(merged, update);
    }, {});
  }
}