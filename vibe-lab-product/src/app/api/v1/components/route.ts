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
    
    // Parse search parameters
    const category = searchParams.get('category') || undefined;
    const tags = searchParams.get('tags')?.split(',') || undefined;
    const templateId = searchParams.get('templateId') || undefined;
    const query = searchParams.get('query') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Search components
    const result = await componentCatalog.searchComponents({
      category,
      tags,
      templateId,
      query,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        service: 'component-catalog'
      }
    });

  } catch (error) {
    console.error('Component search error:', error);
    
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle component recommendations
    if (body.type === 'recommendations') {
      const { blueprintAnalysis, templateId, userHistory, limit } = body;
      
      const result = await componentCatalog.getRecommendations({
        blueprintAnalysis,
        templateId,
        userHistory,
        limit
      });

      return NextResponse.json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          service: 'component-catalog'
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid request type',
      meta: {
        timestamp: new Date().toISOString(),
        service: 'component-catalog'
      }
    }, { status: 400 });

  } catch (error) {
    console.error('Component recommendation error:', error);
    
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