/**
 * Component Service
 * 
 * Provides metadata for the UI components used in the application.
 */
import { ComponentMetadata } from '@/lib/avca/pipeline/component-pipeline/types';

// --- COMPONENT DEFINITIONS ---

const allComponents: ComponentMetadata[] = [
    {
        id: 'button',
        name: 'Button',
        category: 'INTERACTIVE',
        tags: ['click', 'action', 'submit'],
        description: 'An interactive element for user actions.',
    },
    {
        id: 'card',
        name: 'Card',
        category: 'LAYOUT',
        tags: ['container', 'panel', 'surface'],
        description: 'A container for content and actions.',
    },
    {
        id: 'input',
        name: 'Input',
        category: 'FORM',
        tags: ['form', 'field', 'text'],
        description: 'A form control for entering text.',
    },
    {
        id: 'alert',
        name: 'Alert',
        category: 'FEEDBACK',
        tags: ['notification', 'message', 'warning'],
        description: 'Displays a short, important message.',
    },
    {
        id: 'table',
        name: 'Table',
        category: 'DATA_DISPLAY',
        tags: ['grid', 'data', 'rows'],
        description: 'A component for displaying data in a tabular format.',
    },
    // Add other components here as they are created
];


export class ComponentService {
  private components: ComponentMetadata[];

  constructor() {
    this.components = allComponents;
  }

  public async getComponents(): Promise<ComponentMetadata[]> {
    return Promise.resolve(this.components);
  }
}
