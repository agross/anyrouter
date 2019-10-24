import SparklineWithoutScrollOffset from 'vue-sparklines/components/charts/Sparkline';

export default class SparklineTooltipPatch {
  public static apply() {
    const after = (fn: any, runAfter: (sparkline: any) => void) => {
      return function(this: any) {
        const res = fn.apply(this, arguments);
        runAfter(this);
        return res;
      };
    };

    const addScrollPosition = (sparkline: any) => {
      const add = (numPx: string, offset: number) => {
        const numbers = numPx.match(/\d+/);
        if (!numbers || !numbers.length) {
          return numPx;
        }
        const num = numbers.map(Number)[0];
        return `${num + offset}px`;
      };

      const style = sparkline.$refs.sparklineTooltip.style;
      style.left = add(style.left, window.scrollX);
      style.top = add(style.top, window.scrollY);
    };

    SparklineWithoutScrollOffset.methods.updateData =
      after(SparklineWithoutScrollOffset.methods.updateData,
        addScrollPosition);

  }
}
