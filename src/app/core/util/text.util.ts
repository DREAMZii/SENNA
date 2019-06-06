import * as d3 from 'd3';

export class TextUtil {
  public static wrap(textContainer, news, width, lineHeight) {
    textContainer.each(function() {
      const text = d3.select(this);
      const titleWords = news.getName().split(/\s+/).reverse();
      const score = 'Sentiment - Score: ' + Math.trunc(news.getScore() * 100);
      const scoreWords = score.split(/\s+/).reverse();
      const sourceWords = news.getSource().split(/\s+/).reverse();
      const dateWords = news.getDatePublished().split(/\s+/).reverse();
      const descWords = news.getDescription().split(/\s+/).reverse();

      TextUtil.tspan(titleWords, text, width, lineHeight, true, false, true);
      TextUtil.tspan(scoreWords, text, width, lineHeight);
      TextUtil.tspan(sourceWords, text, width, lineHeight, true, true);
      TextUtil.tspan(dateWords, text, width, lineHeight);
      TextUtil.tspan(descWords, text, width, lineHeight, false, true);
    });
  }

  private static tspan(words, text, width, lineHeight, bold = false, extraLine = false, headline = false) {
    const size = parseFloat(text.attr('font-size'));
    const x = text.attr('x');
    const y = text.attr('y');
    const dx = parseFloat(text.attr('dx'));
    const dy = parseFloat(text.attr('dy'));

    let initialDy = dy;
    if (text.select(':last-child').node() !== null) {
      initialDy = parseFloat(text.select(':last-child').attr('dy')) + dy;
    }

    if (extraLine) {
      initialDy += dy;
    }

    let word;
    let lineNumber = 0;
    let line = [];
    let tspan = text
      .append('tspan')
      .attr('x', x)
      .attr('y', y)
      .attr('dx', dx + 'px')
      .attr('dy', initialDy + 'px')
      .attr('font-weight', bold ? 'bold' : null)
      .attr('font-size', headline ? size * 1.3 : size);

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width - dx) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text
          .append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dx', dx + 'px')
          .attr('dy', ++lineNumber * lineHeight + initialDy + 'px')
          .attr('font-weight', bold ? 'bold' : null)
          .attr('font-size', headline ? size * 1.3 : size)
          .text(word);
      }
    }
  }
}
