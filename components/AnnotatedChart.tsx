'use client';

import React, { useEffect, useRef } from 'react';

// Type definitions for annotations
interface HorizontalLineAnnotation {
  type: 'horizontal_line';
  y_percent: number;
  label: string;
  price_label: string;
  color?: string;
  style?: 'solid' | 'dashed';
}

interface ZoneAnnotation {
  type: 'zone';
  y_top_percent: number;
  y_bottom_percent: number;
  label: string;
  color?: string;
}

interface ArrowAnnotation {
  type: 'arrow';
  x_percent: number;
  y_percent: number;
  label: string;
  direction: 'buy' | 'sell';
  color?: string;
}

interface LabelAnnotation {
  type: 'label';
  x_percent: number;
  y_percent: number;
  text: string;
  color?: string;
}

type Annotation = HorizontalLineAnnotation | ZoneAnnotation | ArrowAnnotation | LabelAnnotation;

interface AnnotatedChartProps {
  imageFile: File;
  annotations: Annotation[];
  showAnnotations: boolean;
  onToggleAnnotations: () => void;
}

const AnnotatedChart: React.FC<AnnotatedChartProps> = ({
  imageFile,
  annotations,
  showAnnotations,
  onToggleAnnotations,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container || !imageFile) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create object URL from file
    const imageUrl = URL.createObjectURL(imageFile);
    imageUrlRef.current = imageUrl;

    const image = new Image();

    image.onload = () => {
      // Set canvas dimensions based on container width and image aspect ratio
      const containerWidth = container.clientWidth;
      const aspectRatio = image.height / image.width;
      const canvasWidth = containerWidth;
      const canvasHeight = containerWidth * aspectRatio;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Draw image scaled to fit
      ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);

      // Draw annotations if enabled
      if (showAnnotations) {
        drawAnnotations(ctx, canvasWidth, canvasHeight);
      }
    };

    image.src = imageUrl;

    // Cleanup function
    return () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = null;
      }
    };
  }, [imageFile, annotations, showAnnotations]);

  const drawAnnotations = (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    annotations.forEach((annotation) => {
      switch (annotation.type) {
        case 'horizontal_line':
          drawHorizontalLine(ctx, annotation, canvasWidth, canvasHeight);
          break;
        case 'zone':
          drawZone(ctx, annotation, canvasWidth, canvasHeight);
          break;
        case 'arrow':
          drawArrow(ctx, annotation, canvasWidth, canvasHeight);
          break;
        case 'label':
          drawLabel(ctx, annotation, canvasWidth, canvasHeight);
          break;
      }
    });
  };

  const drawHorizontalLine = (
    ctx: CanvasRenderingContext2D,
    annotation: HorizontalLineAnnotation,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const y = (annotation.y_percent / 100) * canvasHeight;
    const color = annotation.color || '#3B82F6';

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    if (annotation.style === 'dashed') {
      ctx.setLineDash([5, 5]);
    }

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw label pill on the right side
    const labelText = `${annotation.label} ${annotation.price_label}`;
    const pillPadding = 8;
    const pillHeight = 24;
    const fontSize = 12;

    ctx.font = `${fontSize}px sans-serif`;
    const textMetrics = ctx.measureText(labelText);
    const textWidth = textMetrics.width;
    const pillWidth = textWidth + pillPadding * 2;

    const pillX = canvasWidth - pillWidth - 8;
    const pillY = y - pillHeight / 2;

    // Draw pill background
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 12);
    ctx.fill();

    // Draw text
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, pillX + pillWidth / 2, pillY + pillHeight / 2);
  };

  const drawZone = (
    ctx: CanvasRenderingContext2D,
    annotation: ZoneAnnotation,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const yTop = (annotation.y_top_percent / 100) * canvasHeight;
    const yBottom = (annotation.y_bottom_percent / 100) * canvasHeight;
    const color = annotation.color || '#10B981';
    const zoneHeight = yBottom - yTop;

    // Draw semi-transparent fill
    ctx.fillStyle = color + '30'; // 30% opacity
    ctx.fillRect(0, yTop, canvasWidth, zoneHeight);

    // Draw dashed borders
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // Top border
    ctx.beginPath();
    ctx.moveTo(0, yTop);
    ctx.lineTo(canvasWidth, yTop);
    ctx.stroke();

    // Bottom border
    ctx.beginPath();
    ctx.moveTo(0, yBottom);
    ctx.lineTo(canvasWidth, yBottom);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw label text inside zone on left side
    const fontSize = 13;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const labelY = yTop + zoneHeight / 2;
    ctx.fillText(annotation.label, 12, labelY);
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    annotation: ArrowAnnotation,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const x = (annotation.x_percent / 100) * canvasWidth;
    const y = (annotation.y_percent / 100) * canvasHeight;
    const color = annotation.color || (annotation.direction === 'buy' ? '#10B981' : '#EF4444');
    const arrowSize = 12;

    // Draw triangle arrow
    ctx.fillStyle = color;
    ctx.beginPath();

    if (annotation.direction === 'buy') {
      // Up arrow
      ctx.moveTo(x, y - arrowSize);
      ctx.lineTo(x - arrowSize / 2, y + arrowSize / 2);
      ctx.lineTo(x + arrowSize / 2, y + arrowSize / 2);
    } else {
      // Down arrow
      ctx.moveTo(x, y + arrowSize);
      ctx.lineTo(x - arrowSize / 2, y - arrowSize / 2);
      ctx.lineTo(x + arrowSize / 2, y - arrowSize / 2);
    }

    ctx.closePath();
    ctx.fill();

    // Draw label above or below arrow
    const fontSize = 12;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';

    const labelY = annotation.direction === 'buy' ? y - arrowSize - 8 : y + arrowSize + 16;
    ctx.textBaseline = 'middle';
    ctx.fillText(annotation.label, x, labelY);
  };

  const drawLabel = (
    ctx: CanvasRenderingContext2D,
    annotation: LabelAnnotation,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const x = (annotation.x_percent / 100) * canvasWidth;
    const y = (annotation.y_percent / 100) * canvasHeight;
    const color = annotation.color || '#6B7280';
    const pillPadding = 6;
    const pillHeight = 20;
    const fontSize = 11;

    ctx.font = `${fontSize}px sans-serif`;
    const textMetrics = ctx.measureText(annotation.text);
    const textWidth = textMetrics.width;
    const pillWidth = textWidth + pillPadding * 2;

    const pillX = x - pillWidth / 2;
    const pillY = y - pillHeight / 2;

    // Draw pill background
    ctx.fillStyle = color + '20'; // 20% opacity
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Draw text
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(annotation.text, x, y);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `chart-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-auto block"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onToggleAnnotations}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          {showAnnotations ? 'Hide Levels' : 'Show Levels'}
        </button>

        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          Download Chart
        </button>
      </div>
    </div>
  );
};

export default AnnotatedChart;
