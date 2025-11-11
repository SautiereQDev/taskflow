'use strict';
(() => {
  // src/frontend/utils/htmx-filters-url.ts
  function convertFormDataToObject(params) {
    if (params instanceof FormData) {
      const result = {};
      const keys = /* @__PURE__ */ new Set();
      for (const key of params.keys()) {
        keys.add(key);
      }
      for (const key of keys) {
        const values = params.getAll(key).map((v) => (typeof v === 'string' ? v : v.name));
        result[key] = values.length > 1 ? values : values[0];
      }
      return result;
    }
    return { ...params };
  }
  function filterEmptyValues(paramsObj) {
    const filtered = {};
    for (const key in paramsObj) {
      const value = paramsObj[key];
      if (Array.isArray(value)) {
        const nonEmpty = value.filter((v) => v !== null && v.trim() !== '');
        if (nonEmpty.length > 0) {
          filtered[key] = nonEmpty;
        }
      } else if (typeof value === 'string' && value.trim() !== '') {
        filtered[key] = value;
      }
    }
    return filtered;
  }
  function filterEmptyParameters(params) {
    const paramsObj = convertFormDataToObject(params);
    console.info('[Filter] Original parameters:', paramsObj);
    return filterEmptyValues(paramsObj);
  }
  document.addEventListener('DOMContentLoaded', () => {
    const filtersForm = document.getElementById('filters-form');
    if (filtersForm === null) return;
    let debounceTimer = null;
    const triggerFilterUpdate = () => {
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = globalThis.setTimeout(() => {
        console.info('[Filter] Triggering HTMX request');
        const htmx = globalThis.htmx;
        if (htmx?.trigger) {
          htmx.trigger(filtersForm, 'submit');
        }
      }, 300);
    };
    const filterInputs = filtersForm.querySelectorAll(
      'input[type="checkbox"], input[type="radio"], input[type="text"], input[type="search"], select'
    );
    console.info(`[Filter] Found ${filterInputs.length} filter inputs`);
    for (const input of filterInputs) {
      if (
        input instanceof HTMLInputElement &&
        (input.type === 'checkbox' || input.type === 'radio')
      ) {
        input.addEventListener('change', () => {
          console.info(`[Filter] ${input.type} changed:`, input.name, input.value, input.checked);
          triggerFilterUpdate();
        });
      }
      if (input instanceof HTMLInputElement && (input.type === 'text' || input.type === 'search')) {
        input.addEventListener('input', () => {
          console.info(`[Filter] Text input changed:`, input.name, input.value);
          triggerFilterUpdate();
        });
      }
      if (input instanceof HTMLSelectElement) {
        input.addEventListener('change', () => {
          console.info(`[Filter] Select changed:`, input.name, input.value);
          triggerFilterUpdate();
        });
      }
    }
    document.body.addEventListener('htmx:configRequest', (event) => {
      const customEvent = event;
      if (customEvent.detail.elt !== filtersForm && !filtersForm.contains(customEvent.detail.elt)) {
        return;
      }
      console.info('[Filter] Intercepting HTMX configRequest');
      customEvent.detail.parameters = filterEmptyParameters(customEvent.detail.parameters);
      console.info('[Filter] Filtered parameters:', customEvent.detail.parameters);
    });
    filtersForm.addEventListener('submit', () => {
      console.info('[Filter] Form submitted');
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
    });
    const resetButton = document.getElementById('reset-filters-btn');
    if (resetButton !== null) {
      resetButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.info('[Filter] Reset button clicked');
        filtersForm.reset();
        const htmx = globalThis.htmx;
        if (htmx?.trigger) {
          htmx.trigger(filtersForm, 'submit');
        }
      });
    }
    console.info('[Filter] Initialization complete');
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL2Zyb250ZW5kL3V0aWxzL2h0bXgtZmlsdGVycy11cmwudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogSFRNWCAyLjAgLSBUYXNrIEZpbHRlcnMgRW5oYW5jZW1lbnRcbiAqXG4gKiBQYXR0ZXJuOiBKYXZhU2NyaXB0IGxpc3RlbnMgdG8gZm9ybSBpbnB1dCBjaGFuZ2VzIGFuZCB0cmlnZ2VycyBIVE1YIHJlcXVlc3RcbiAqIEZvcm0gaGFzIGh4LWdldD1cIi90YXNrc1wiIGh4LXRyaWdnZXI9XCJzdWJtaXRcIiAtIEhUTVggaGFuZGxlcyBzdWJtaXQgZXZlbnRzXG4gKiBXZSBtYW51YWxseSB0cmlnZ2VyIHRoZSBzdWJtaXQgZXZlbnQgd2hlbiBmaWx0ZXJzIGNoYW5nZVxuICpcbiAqIENSSVRJQ0FMOiBXZSBhbHNvIGludGVyY2VwdCBodG14OmNvbmZpZ1JlcXVlc3QgdG8gcmVtb3ZlIGVtcHR5IHBhcmFtZXRlcnNcbiAqL1xuXG5pbnRlcmZhY2UgSUh0bXhDb25maWdSZXF1ZXN0RGV0YWlsIHtcbiAgZWx0OiBIVE1MRWxlbWVudDtcbiAgcGFyYW1ldGVyczogRm9ybURhdGEgfCBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxuaW50ZXJmYWNlIElIdG14IHtcbiAgdHJpZ2dlcjogKGVsdDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nKSA9PiB2b2lkO1xufVxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbiAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgaHRteDogSUh0bXg7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0IEZvcm1EYXRhIG9yIG9iamVjdCB0byBwbGFpbiBvYmplY3RcbiAqL1xuZnVuY3Rpb24gY29udmVydEZvcm1EYXRhVG9PYmplY3QoXG4gIHBhcmFtczogRm9ybURhdGEgfCBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgc3RyaW5nW10+IHtcbiAgaWYgKHBhcmFtcyBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG4gICAgY29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBzdHJpbmdbXT4gPSB7fTtcbiAgICBjb25zdCBrZXlzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgcGFyYW1zLmtleXMoKSkge1xuICAgICAga2V5cy5hZGQoa2V5KTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgY29uc3QgdmFsdWVzID0gcGFyYW1zLmdldEFsbChrZXkpLm1hcCgodikgPT4gKHR5cGVvZiB2ID09PSAnc3RyaW5nJyA/IHYgOiB2Lm5hbWUpKTtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsdWVzLmxlbmd0aCA+IDEgPyB2YWx1ZXMgOiB2YWx1ZXNbMF07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHsgLi4uKHBhcmFtcyBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSB9O1xufVxuXG4vKipcbiAqIEZpbHRlciBvdXQgZW1wdHkgdmFsdWVzIGZyb20gcGFyYW1ldGVyc1xuICovXG5mdW5jdGlvbiBmaWx0ZXJFbXB0eVZhbHVlcyhcbiAgcGFyYW1zT2JqOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBzdHJpbmdbXT5cbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHN0cmluZ1tdPiB7XG4gIGNvbnN0IGZpbHRlcmVkOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBzdHJpbmdbXT4gPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1zT2JqKSB7XG4gICAgY29uc3QgdmFsdWUgPSBwYXJhbXNPYmpba2V5XTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIGNvbnN0IG5vbkVtcHR5ID0gdmFsdWUuZmlsdGVyKCh2KSA9PiB2ICE9PSBudWxsICYmIHYudHJpbSgpICE9PSAnJyk7XG4gICAgICBpZiAobm9uRW1wdHkubGVuZ3RoID4gMCkge1xuICAgICAgICBmaWx0ZXJlZFtrZXldID0gbm9uRW1wdHk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgIGZpbHRlcmVkW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZpbHRlcmVkO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYW5kIGZpbHRlciBlbXB0eSBwYXJhbWV0ZXJzXG4gKi9cbmZ1bmN0aW9uIGZpbHRlckVtcHR5UGFyYW1ldGVycyhcbiAgcGFyYW1zOiBGb3JtRGF0YSB8IFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBzdHJpbmdbXT4ge1xuICBjb25zdCBwYXJhbXNPYmogPSBjb252ZXJ0Rm9ybURhdGFUb09iamVjdChwYXJhbXMpO1xuICBjb25zb2xlLmluZm8oJ1tGaWx0ZXJdIE9yaWdpbmFsIHBhcmFtZXRlcnM6JywgcGFyYW1zT2JqKTtcbiAgcmV0dXJuIGZpbHRlckVtcHR5VmFsdWVzKHBhcmFtc09iaik7XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gIGNvbnN0IGZpbHRlcnNGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcnMtZm9ybScpIGFzIEhUTUxGb3JtRWxlbWVudCB8IG51bGw7XG5cbiAgaWYgKGZpbHRlcnNGb3JtID09PSBudWxsKSByZXR1cm47XG5cbiAgbGV0IGRlYm91bmNlVGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIC8vIEZ1bmN0aW9uIHRvIHRyaWdnZXIgSFRNWCByZXF1ZXN0IHZpYSBzdWJtaXQgZXZlbnRcbiAgY29uc3QgdHJpZ2dlckZpbHRlclVwZGF0ZSA9ICgpOiB2b2lkID0+IHtcbiAgICAvLyBDbGVhciBhbnkgcGVuZGluZyBkZWJvdW5jZVxuICAgIGlmIChkZWJvdW5jZVRpbWVyICE9PSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQoZGVib3VuY2VUaW1lcik7XG4gICAgfVxuXG4gICAgLy8gRGVib3VuY2U6IHdhaXQgMzAwbXMgYWZ0ZXIgbGFzdCBjaGFuZ2UgYmVmb3JlIHRyaWdnZXJpbmdcbiAgICBkZWJvdW5jZVRpbWVyID0gZ2xvYmFsVGhpcy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnNvbGUuaW5mbygnW0ZpbHRlcl0gVHJpZ2dlcmluZyBIVE1YIHJlcXVlc3QnKTtcblxuICAgICAgLy8gVXNlIEhUTVgncyBBUEkgdG8gdHJpZ2dlciB0aGUgcmVxdWVzdFxuICAgICAgY29uc3QgaHRteCA9IGdsb2JhbFRoaXMuaHRteCBhcyBJSHRteCB8IHVuZGVmaW5lZDtcbiAgICAgIGlmIChodG14Py50cmlnZ2VyKSB7XG4gICAgICAgIGh0bXgudHJpZ2dlcihmaWx0ZXJzRm9ybSwgJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH0sIDMwMCk7XG4gIH07XG5cbiAgLy8gTGlzdGVuIHRvIGNoYW5nZXMgb24gYWxsIGZpbHRlciBpbnB1dHNcbiAgY29uc3QgZmlsdGVySW5wdXRzID0gZmlsdGVyc0Zvcm0ucXVlcnlTZWxlY3RvckFsbDxIVE1MSW5wdXRFbGVtZW50IHwgSFRNTFNlbGVjdEVsZW1lbnQ+KFxuICAgICdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0sIGlucHV0W3R5cGU9XCJyYWRpb1wiXSwgaW5wdXRbdHlwZT1cInRleHRcIl0sIGlucHV0W3R5cGU9XCJzZWFyY2hcIl0sIHNlbGVjdCdcbiAgKTtcblxuICBjb25zb2xlLmluZm8oYFtGaWx0ZXJdIEZvdW5kICR7ZmlsdGVySW5wdXRzLmxlbmd0aH0gZmlsdGVyIGlucHV0c2ApO1xuXG4gIGZvciAoY29uc3QgaW5wdXQgb2YgZmlsdGVySW5wdXRzKSB7XG4gICAgLy8gRm9yIGNoZWNrYm94ZXMgYW5kIHJhZGlvcywgdHJpZ2dlciBvbiBjaGFuZ2VcbiAgICBpZiAoXG4gICAgICBpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgJiZcbiAgICAgIChpbnB1dC50eXBlID09PSAnY2hlY2tib3gnIHx8IGlucHV0LnR5cGUgPT09ICdyYWRpbycpXG4gICAgKSB7XG4gICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW0ZpbHRlcl0gJHtpbnB1dC50eXBlfSBjaGFuZ2VkOmAsIGlucHV0Lm5hbWUsIGlucHV0LnZhbHVlLCBpbnB1dC5jaGVja2VkKTtcbiAgICAgICAgdHJpZ2dlckZpbHRlclVwZGF0ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRm9yIHRleHQgaW5wdXRzLCB0cmlnZ2VyIG9uIGlucHV0ICh0eXBpbmcpXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiAoaW5wdXQudHlwZSA9PT0gJ3RleHQnIHx8IGlucHV0LnR5cGUgPT09ICdzZWFyY2gnKSkge1xuICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgW0ZpbHRlcl0gVGV4dCBpbnB1dCBjaGFuZ2VkOmAsIGlucHV0Lm5hbWUsIGlucHV0LnZhbHVlKTtcbiAgICAgICAgdHJpZ2dlckZpbHRlclVwZGF0ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRm9yIHNlbGVjdCwgdHJpZ2dlciBvbiBjaGFuZ2VcbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MU2VsZWN0RWxlbWVudCkge1xuICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmluZm8oYFtGaWx0ZXJdIFNlbGVjdCBjaGFuZ2VkOmAsIGlucHV0Lm5hbWUsIGlucHV0LnZhbHVlKTtcbiAgICAgICAgdHJpZ2dlckZpbHRlclVwZGF0ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ1JJVElDQUw6IEludGVyY2VwdCBIVE1YIHJlcXVlc3QgY29uZmlndXJhdGlvbiB0byBmaWx0ZXIgZW1wdHkgcGFyYW1ldGVyc1xuICAvLyBUaGlzIHByZXZlbnRzIHNlbmRpbmcgP3NlYXJjaD0mYXNzaWduZWVJZD0mZHVlRGF0ZUZpbHRlcj0gaW4gdGhlIFVSTFxuICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2h0bXg6Y29uZmlnUmVxdWVzdCcsIChldmVudDogRXZlbnQpID0+IHtcbiAgICBjb25zdCBjdXN0b21FdmVudCA9IGV2ZW50IGFzIEN1c3RvbUV2ZW50PElIdG14Q29uZmlnUmVxdWVzdERldGFpbD47XG5cbiAgICAvLyBPbmx5IHByb2Nlc3MgZXZlbnRzIGZyb20gb3VyIGZpbHRlcnMgZm9ybVxuICAgIGlmIChjdXN0b21FdmVudC5kZXRhaWwuZWx0ICE9PSBmaWx0ZXJzRm9ybSAmJiAhZmlsdGVyc0Zvcm0uY29udGFpbnMoY3VzdG9tRXZlbnQuZGV0YWlsLmVsdCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmluZm8oJ1tGaWx0ZXJdIEludGVyY2VwdGluZyBIVE1YIGNvbmZpZ1JlcXVlc3QnKTtcbiAgICBjdXN0b21FdmVudC5kZXRhaWwucGFyYW1ldGVycyA9IGZpbHRlckVtcHR5UGFyYW1ldGVycyhjdXN0b21FdmVudC5kZXRhaWwucGFyYW1ldGVycyk7XG4gICAgY29uc29sZS5pbmZvKCdbRmlsdGVyXSBGaWx0ZXJlZCBwYXJhbWV0ZXJzOicsIGN1c3RvbUV2ZW50LmRldGFpbC5wYXJhbWV0ZXJzKTtcbiAgfSk7XG5cbiAgLy8gSGFuZGxlIGZvcm0gc3VibWl0IGJ1dHRvbiAobm8gZGVib3VuY2UsIGltbWVkaWF0ZSB0cmlnZ2VyKVxuICBmaWx0ZXJzRm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoKSA9PiB7XG4gICAgY29uc29sZS5pbmZvKCdbRmlsdGVyXSBGb3JtIHN1Ym1pdHRlZCcpO1xuICAgIC8vIENsZWFyIGRlYm91bmNlIHRpbWVyIGlmIGV4aXN0c1xuICAgIGlmIChkZWJvdW5jZVRpbWVyICE9PSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQoZGVib3VuY2VUaW1lcik7XG4gICAgICBkZWJvdW5jZVRpbWVyID0gbnVsbDtcbiAgICB9XG4gICAgLy8gTGV0IEhUTVggaGFuZGxlIHRoZSBzdWJtaXQgbmF0dXJhbGx5IChkb24ndCBwcmV2ZW50IGRlZmF1bHQpXG4gIH0pO1xuXG4gIC8vIEhhbmRsZSByZXNldCBidXR0b25cbiAgY29uc3QgcmVzZXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQtZmlsdGVycy1idG4nKTtcbiAgaWYgKHJlc2V0QnV0dG9uICE9PSBudWxsKSB7XG4gICAgcmVzZXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc29sZS5pbmZvKCdbRmlsdGVyXSBSZXNldCBidXR0b24gY2xpY2tlZCcpO1xuXG4gICAgICAvLyBSZXNldCB0aGUgZm9ybVxuICAgICAgZmlsdGVyc0Zvcm0ucmVzZXQoKTtcblxuICAgICAgLy8gVHJpZ2dlciBIVE1YIHRvIHJlbG9hZCB3aXRoIGNsZWFuIGZvcm0gKG5vIGZpbHRlcnMpXG4gICAgICBjb25zdCBodG14ID0gZ2xvYmFsVGhpcy5odG14IGFzIElIdG14IHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKGh0bXg/LnRyaWdnZXIpIHtcbiAgICAgICAgaHRteC50cmlnZ2VyKGZpbHRlcnNGb3JtLCAnc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb25zb2xlLmluZm8oJ1tGaWx0ZXJdIEluaXRpYWxpemF0aW9uIGNvbXBsZXRlJyk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQThCQSxXQUFTLHdCQUNQLFFBQ21DO0FBQ25DLFFBQUksa0JBQWtCLFVBQVU7QUFDOUIsWUFBTSxTQUE0QyxDQUFDO0FBQ25ELFlBQU0sT0FBTyxvQkFBSSxJQUFZO0FBQzdCLGlCQUFXLE9BQU8sT0FBTyxLQUFLLEdBQUc7QUFDL0IsYUFBSyxJQUFJLEdBQUc7QUFBQSxNQUNkO0FBQ0EsaUJBQVcsT0FBTyxNQUFNO0FBQ3RCLGNBQU0sU0FBUyxPQUFPLE9BQU8sR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFPLE9BQU8sTUFBTSxXQUFXLElBQUksRUFBRSxJQUFLO0FBQ2pGLGVBQU8sR0FBRyxJQUFJLE9BQU8sU0FBUyxJQUFJLFNBQVMsT0FBTyxDQUFDO0FBQUEsTUFDckQ7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUNBLFdBQU8sRUFBRSxHQUFJLE9BQWtDO0FBQUEsRUFDakQ7QUFLQSxXQUFTLGtCQUNQLFdBQ21DO0FBQ25DLFVBQU0sV0FBOEMsQ0FBQztBQUNyRCxlQUFXLE9BQU8sV0FBVztBQUMzQixZQUFNLFFBQVEsVUFBVSxHQUFHO0FBQzNCLFVBQUksTUFBTSxRQUFRLEtBQUssR0FBRztBQUN4QixjQUFNLFdBQVcsTUFBTSxPQUFPLENBQUMsTUFBTSxNQUFNLFFBQVEsRUFBRSxLQUFLLE1BQU0sRUFBRTtBQUNsRSxZQUFJLFNBQVMsU0FBUyxHQUFHO0FBQ3ZCLG1CQUFTLEdBQUcsSUFBSTtBQUFBLFFBQ2xCO0FBQUEsTUFDRixXQUFXLE9BQU8sVUFBVSxZQUFZLE1BQU0sS0FBSyxNQUFNLElBQUk7QUFDM0QsaUJBQVMsR0FBRyxJQUFJO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFLQSxXQUFTLHNCQUNQLFFBQ21DO0FBQ25DLFVBQU0sWUFBWSx3QkFBd0IsTUFBTTtBQUNoRCxZQUFRLEtBQUssaUNBQWlDLFNBQVM7QUFDdkQsV0FBTyxrQkFBa0IsU0FBUztBQUFBLEVBQ3BDO0FBRUEsV0FBUyxpQkFBaUIsb0JBQW9CLE1BQU07QUFDbEQsVUFBTSxjQUFjLFNBQVMsZUFBZSxjQUFjO0FBRTFELFFBQUksZ0JBQWdCLEtBQU07QUFFMUIsUUFBSSxnQkFBK0I7QUFHbkMsVUFBTSxzQkFBc0IsTUFBWTtBQUV0QyxVQUFJLGtCQUFrQixNQUFNO0FBQzFCLHFCQUFhLGFBQWE7QUFBQSxNQUM1QjtBQUdBLHNCQUFnQixXQUFXLFdBQVcsTUFBTTtBQUMxQyxnQkFBUSxLQUFLLGtDQUFrQztBQUcvQyxjQUFNLE9BQU8sV0FBVztBQUN4QixZQUFJLE1BQU0sU0FBUztBQUNqQixlQUFLLFFBQVEsYUFBYSxRQUFRO0FBQUEsUUFDcEM7QUFBQSxNQUNGLEdBQUcsR0FBRztBQUFBLElBQ1I7QUFHQSxVQUFNLGVBQWUsWUFBWTtBQUFBLE1BQy9CO0FBQUEsSUFDRjtBQUVBLFlBQVEsS0FBSyxrQkFBa0IsYUFBYSxNQUFNLGdCQUFnQjtBQUVsRSxlQUFXLFNBQVMsY0FBYztBQUVoQyxVQUNFLGlCQUFpQixxQkFDaEIsTUFBTSxTQUFTLGNBQWMsTUFBTSxTQUFTLFVBQzdDO0FBQ0EsY0FBTSxpQkFBaUIsVUFBVSxNQUFNO0FBQ3JDLGtCQUFRLEtBQUssWUFBWSxNQUFNLElBQUksYUFBYSxNQUFNLE1BQU0sTUFBTSxPQUFPLE1BQU0sT0FBTztBQUN0Riw4QkFBb0I7QUFBQSxRQUN0QixDQUFDO0FBQUEsTUFDSDtBQUdBLFVBQUksaUJBQWlCLHFCQUFxQixNQUFNLFNBQVMsVUFBVSxNQUFNLFNBQVMsV0FBVztBQUMzRixjQUFNLGlCQUFpQixTQUFTLE1BQU07QUFDcEMsa0JBQVEsS0FBSyxnQ0FBZ0MsTUFBTSxNQUFNLE1BQU0sS0FBSztBQUNwRSw4QkFBb0I7QUFBQSxRQUN0QixDQUFDO0FBQUEsTUFDSDtBQUdBLFVBQUksaUJBQWlCLG1CQUFtQjtBQUN0QyxjQUFNLGlCQUFpQixVQUFVLE1BQU07QUFDckMsa0JBQVEsS0FBSyw0QkFBNEIsTUFBTSxNQUFNLE1BQU0sS0FBSztBQUNoRSw4QkFBb0I7QUFBQSxRQUN0QixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFJQSxhQUFTLEtBQUssaUJBQWlCLHNCQUFzQixDQUFDLFVBQWlCO0FBQ3JFLFlBQU0sY0FBYztBQUdwQixVQUFJLFlBQVksT0FBTyxRQUFRLGVBQWUsQ0FBQyxZQUFZLFNBQVMsWUFBWSxPQUFPLEdBQUcsR0FBRztBQUMzRjtBQUFBLE1BQ0Y7QUFFQSxjQUFRLEtBQUssMENBQTBDO0FBQ3ZELGtCQUFZLE9BQU8sYUFBYSxzQkFBc0IsWUFBWSxPQUFPLFVBQVU7QUFDbkYsY0FBUSxLQUFLLGlDQUFpQyxZQUFZLE9BQU8sVUFBVTtBQUFBLElBQzdFLENBQUM7QUFHRCxnQkFBWSxpQkFBaUIsVUFBVSxNQUFNO0FBQzNDLGNBQVEsS0FBSyx5QkFBeUI7QUFFdEMsVUFBSSxrQkFBa0IsTUFBTTtBQUMxQixxQkFBYSxhQUFhO0FBQzFCLHdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFFRixDQUFDO0FBR0QsVUFBTSxjQUFjLFNBQVMsZUFBZSxtQkFBbUI7QUFDL0QsUUFBSSxnQkFBZ0IsTUFBTTtBQUN4QixrQkFBWSxpQkFBaUIsU0FBUyxDQUFDLE1BQWtCO0FBQ3ZELFVBQUUsZUFBZTtBQUNqQixnQkFBUSxLQUFLLCtCQUErQjtBQUc1QyxvQkFBWSxNQUFNO0FBR2xCLGNBQU0sT0FBTyxXQUFXO0FBQ3hCLFlBQUksTUFBTSxTQUFTO0FBQ2pCLGVBQUssUUFBUSxhQUFhLFFBQVE7QUFBQSxRQUNwQztBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFFQSxZQUFRLEtBQUssa0NBQWtDO0FBQUEsRUFDakQsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
