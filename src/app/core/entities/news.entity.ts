import * as d3 from 'd3';

export class News {
  private readonly name: string;
  private description: string;
  private category: any;
  private url: string;
  private datePublished: string;

  public sentiment = 0.5;

  constructor(name, description, category, url, datePublished) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.url = url;
    this.datePublished = datePublished;
  }

  public draw(svg, x, y, width, height, id) {
    if (this.isDrawn(svg, id)) {
      svg.select(`.news-${id}`)
        .transition()
        .style('opacity', '1');

      return;
    }

    const group = svg.append('g')
      .attr('class', `news news-${id}`)
      .style('opacity', '0');

    group.append('line')
      .style('stroke', 'green')
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', y - height);

    group.append('line')
      .style('stroke', 'green')
      .attr('x1', x)
      .attr('y1', y - height)
      .attr('x2', x + width)
      .attr('y2', y - height);

    group.append('text')
      .attr('x', x + 12)
      .attr('y', y - height + 12)
      .attr('dy', '.71')
      .text(this.name)
      .call(this.wrap, width);

    group.transition()
      .style('opacity', '1');
  }

  private isDrawn(svg, id) {
    return svg.selectAll(`.news-${id}`).size() > 0;
  }

  private wrap(peter, width) {
    peter.each(function() {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      const lineHeight = 1.1;
      const x = text.attr('x');
      const y = text.attr('y');
      const dy = parseFloat(text.attr('dy'));

      let word;
      let lineNumber = 0;
      let line = [];
      let tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
        }
      }
    });
  }

  public getName() {
    return this.name;
  }
}
