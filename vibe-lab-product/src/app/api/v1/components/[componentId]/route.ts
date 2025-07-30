import { NextRequest, NextResponse } from 'next/server';
import { ComponentCatalogService } from '../../../../../../lib/avca/services/component-catalog-service';
import { EventBus } from '../../../../../../lib/avca/services/event-bus';
import { ComponentVariation } from '../../../../../../lib/avca/pipeline/component-pipeline/types';

// Initialize component catalog service
const eventBus = new EventBus();
const componentCatalog = new ComponentCatalogService({
  eventBus,
  cdnUrl: process.env.COMPONENT_CDN_URL || 'https://cdn.vibelab.com/components'
});

export async function GET(
  request: NextRequest,
  { params }: { params: { componentId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const { componentId } = params;
    
    // Get component details
    const component = await componentCatalog.getComponent(componentId);
    
    if (!component) {
      return NextResponse.json({
        success: false,
        error: 'Component not found',
        meta: {
          timestamp: new Date().toISOString(),
          service: 'component-catalog'
        }
      }, { status: 404 });
    }

    // Get template-specific variations if requested
    const templateId = searchParams.get('templateId');
    let variations: ComponentVariation[] = [];
    
    if (templateId) {
      variations = await componentCatalog.getComponentVariations(componentId, templateId);
    }

    return NextResponse.json({
      success: true,
      data: {
        component,
        variations: templateId ? variations : component.templateVariations
      },
      meta: {
        timestamp: new Date().toISOString(),
        service: 'component-catalog'
      }
    });

  } catch (error) {
    console.error('Component detail error:', error);
    
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