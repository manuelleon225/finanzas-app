export type BarChartGroupInput = {
  label: string;
  values: number[];
};

export type BarChartBar = {
  x: number;
  y: number;
  height: number;
  width: number;
  value: number;
  seriesIndex: number;
};

export type BarChartTouchRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BarChartGroupLayout = {
  x: number;
  groupX: number;
  left: number;
  center: number;
  bars: BarChartBar[];
  barRects: BarChartBar[];
  touchRect: BarChartTouchRect;
  touchArea: BarChartTouchRect;
};

export type BarChartLayout = BarChartGroupLayout[] & {
  groups: BarChartGroupLayout[];
  max: number;
};

export function buildBarChartLayout({
  data,
  width,
  height,
  barWidth = 10,
  innerGap = 4,
}: {
  data: BarChartGroupInput[];
  width: number;
  height: number;
  barWidth?: number;
  innerGap?: number;
}): BarChartLayout {
  const groups: BarChartGroupLayout[] = [];
  const allValues = data.flatMap((group) => group.values);
  const max = allValues.length > 0 ? Math.max(0, ...allValues) : 0;

  if (data.length === 0 || width <= 0) {
    const result = groups as BarChartLayout;
    result.groups = groups;
    result.max = max;
    return result;
  }

  const groupWidth = width / data.length;

  data.forEach((group, groupIndex) => {
    const groupLeft = groupIndex * groupWidth;
    const groupCenter = groupLeft + groupWidth / 2;
    const seriesCount = group.values.length;
    const barsWidth = seriesCount * barWidth + Math.max(0, seriesCount - 1) * innerGap;
    const startX = groupCenter - barsWidth / 2;

    const bars: BarChartBar[] = group.values.map((value, seriesIndex) => {
      const barHeight = max === 0 ? 2 : Math.max(0, (value / max) * height);
      return {
        x: startX + seriesIndex * (barWidth + innerGap),
        y: height - barHeight,
        height: barHeight,
        width: barWidth,
        value,
        seriesIndex,
      };
    });

    const touchRect: BarChartTouchRect = {
      x: groupLeft,
      y: 0,
      width: groupWidth,
      height,
    };

    groups.push({
      x: groupCenter,
      groupX: groupCenter,
      left: groupLeft,
      center: groupCenter,
      bars,
      barRects: bars,
      touchRect,
      touchArea: touchRect,
    });
  });

  const result = groups as BarChartLayout;
  result.groups = groups;
  result.max = max;
  return result;
}
