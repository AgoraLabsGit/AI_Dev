import { NextRequest, NextResponse } from 'next/server';
import { ComponentCatalogService } from '../../../../../lib/avca/services/component-catalog-service';
import { EventBus } from '../../../../../lib/avca/services/event-bus';

// Initialize component catalog service
const eventBus = new EventBus();
const componentCatalog = new ComponentCatalogService({
  eventBus,
  cdnUrl: process.env.COMPONENT_CDN_URL || 'https://cdn.vibelab.com/components'
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get all templates
    const templates = await componentCatalog.getTemplates();
    
    // Filter by category if specified
    const category = searchParams.get('category');
    const filteredTemplates = category 
      ? templates.filter(t => t.category === category)
      : templates;

    return NextResponse.json({
      success: true,
      data: {
        templates: filteredTemplates,
        total: filteredTemplates.length
      },
      meta: {
        timestamp: new Date().toISOString(),
        service: 'component-catalog'
      }
    });

  } catch (error) {
    console.error('Templates error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      meta: {
        timestamp: new Date().toISOString(),
        service: 'component-catalog'
      }
    }, { status: 500 });
  }
} 