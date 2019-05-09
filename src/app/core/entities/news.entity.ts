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

  public draw(container, group, x, y, width, height, id, factor) {
    width /= factor;
    height /= factor;

    const fontSize = 16 / factor;

    const xOffset = 12 / factor;
    const yOffset = 12 / factor;

    container.selectAll('g')
      .filter('.news')
      .transition()
      .duration(750)
      .style('opacity', '0');

    if (this.isDrawn(group, id)) {
      console.log('ciao');
      group.select(`.news-${id}`)
        .transition()
        .duration(750)
        .style('opacity', '1');

      return;
    }

    const lineGroup = group.insert('g', ':first-child')
      .attr('class', `news news-${id}`)
      .style('opacity', '0');

    lineGroup.append('line')
      .style('stroke', 'green')
      .style('stroke-width', 1 / factor)
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', y - height);

    lineGroup.append('line')
      .style('stroke', 'green')
      .style('stroke-width', 1 / factor)
      .attr('x1', x)
      .attr('y1', y - height)
      .attr('x2', x + width)
      .attr('y2', y - height);

    lineGroup.append('text')
      .attr('x', x + xOffset)
      .attr('y', y - height + yOffset)
      .attr('dy', '.71')
      .attr('font-size', fontSize)
      .text(this.name)
      .call(this.wrap, width);
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
