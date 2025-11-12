import { debounce, last } from 'lodash-es';
import { nextTick, onActivated, onBeforeUnmount, onMounted, ref, Ref } from 'vue';
import { addClass, removeClass } from '@btc/shared-components/utils/dom';
import { globalMitt } from '@btc/shared-components/utils/mitt';
import type { TableProps } from '../types';

export function useTableHeight(props: TableProps, tableRef: Ref) {
  const maxHeight = ref<number>(0);

  const update = debounce(async () => {
    await nextTick();

    let vm: any = tableRef.value;

    if (vm) {
      while (
        vm.$parent &&
        !(vm.$parent.$el && vm.$parent.$el.classList && vm.$parent.$el.classList.contains('btc-crud'))
      ) {
        vm = vm.$parent;
      }

      if (vm && vm.$parent?.$el) {
        const crudEl = vm.$parent.$el as HTMLElement;
        const rowEl = vm.$el as HTMLElement;

        await nextTick();

        let h = 0;

        if (rowEl.className.includes('btc-crud-row')) {
          h += 10;
        }

        h += rowEl.offsetTop;

        let sibling = rowEl.nextSibling as HTMLElement | null;
        const arr: HTMLElement[] = [rowEl];

        while (sibling) {
          if (sibling instanceof HTMLElement && sibling.offsetHeight > 0) {
            h += sibling.offsetHeight || 0;
            arr.push(sibling);

            if (sibling.className.includes('btc-crud-row--last')) {
              h += 10;
            }
          }

          sibling = sibling.nextSibling as HTMLElement | null;
        }

        arr.forEach((el) => {
          removeClass(el, 'btc-crud-row--last');
        });

        const lastRow = last(arr);

        if (lastRow?.className.includes('btc-crud-row')) {
          addClass(lastRow, 'btc-crud-row--last');
          h -= 10;
        }

        h += parseInt(window.getComputedStyle(crudEl).paddingTop, 10) || 0;

        if (props.autoHeight) {
          const available = crudEl.clientHeight - h;
          maxHeight.value = available > 0 ? available : 0;
        } else {
          maxHeight.value = 0;
        }
      }
    }
  }, 100);

  const handleResize = () => {
    update();
  };

  globalMitt.on('resize', handleResize);

  onMounted(() => {
    update();
  });

  onActivated(() => {
    update();
  });

  onBeforeUnmount(() => {
    update.cancel();
    globalMitt.off('resize', handleResize);
  });

  return {
    maxHeight,
    calcMaxHeight: update,
  };
}
