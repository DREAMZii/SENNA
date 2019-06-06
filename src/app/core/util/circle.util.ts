export class CircleUtil {
  public static getPointOnCircle(cx, cy, radius, angle) {
    const angleInRad = CircleUtil.getAngleInRadians(angle);

    const x = cx + radius * Math.cos(angleInRad);
    const y = cy + radius * Math.sin(angleInRad);

    return [x, y];
  }

  public static describeArc(x, y, radius, startAngle, endAngle) {
    function polarToCartesian(centerX, centerY, cartesianRadius, angleInDegrees) {
      const angleInRadians = CircleUtil.getAngleInRadians(angleInDegrees);

      return {
        x: centerX + (cartesianRadius * Math.cos(angleInRadians)),
        y: centerY + (cartesianRadius * Math.sin(angleInRadians))
      };
    }

    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  }

  public static getAngleInRadians(angleInDegrees) {
    return (angleInDegrees - 90) * Math.PI / 180.0;
  }
}
