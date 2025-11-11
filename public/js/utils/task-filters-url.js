'use strict';
(() => {
  // src/frontend/utils/task-filters-url.ts
  document.addEventListener('DOMContentLoaded', () => {
    console.info('[Task Filters] URL update script loaded');
    document.body.addEventListener('htmx:afterSwap', (event) => {
      const customEvent = event;
      console.info('[Task Filters] htmx:afterSwap event', customEvent.detail);
      if (customEvent.detail.target?.id === 'task-list-container') {
        console.info('[Task Filters] Updating URL after filter change');
        const form = document.getElementById('filters-form');
        if (form === null) {
          console.warn('[Task Filters] Form not found');
          return;
        }
        const formData = new FormData(form);
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
          const stringValue = typeof value === 'string' ? value : value.name;
          if (stringValue !== null && stringValue !== '') {
            params.append(key, stringValue);
          }
        }
        const newUrl = params.toString() === '' ? '/tasks' : `/tasks?${params.toString()}`;
        console.info('[Task Filters] New URL:', newUrl);
        globalThis.history.pushState({}, '', newUrl);
      }
    });
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL2Zyb250ZW5kL3V0aWxzL3Rhc2stZmlsdGVycy11cmwudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogVGFzayBGaWx0ZXJzIFVSTCBVcGRhdGVcbiAqXG4gKiBNYW51YWxseSB1cGRhdGVzIGJyb3dzZXIgVVJMIHdoZW4gSFRNWCBmaWx0ZXIgcmVzcG9uc2VzIGFycml2ZS5cbiAqIFRoaXMgZW5zdXJlcyBVUkwgc3RheXMgaW4gc3luYyB3aXRoIGZpbHRlciBzdGF0ZS5cbiAqL1xuXG5pbnRlcmZhY2UgSUh0bXhBZnRlclN3YXBEZXRhaWwge1xuICB0YXJnZXQ6IEhUTUxFbGVtZW50O1xuICBba2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICBjb25zb2xlLmluZm8oJ1tUYXNrIEZpbHRlcnNdIFVSTCB1cGRhdGUgc2NyaXB0IGxvYWRlZCcpO1xuXG4gIC8vIExpc3RlbiBmb3IgSFRNWCBhZnRlciBzd2FwIGV2ZW50cyBvbiB0aGUgdGFzayBsaXN0IGNvbnRhaW5lclxuICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2h0bXg6YWZ0ZXJTd2FwJywgKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgIGNvbnN0IGN1c3RvbUV2ZW50ID0gZXZlbnQgYXMgQ3VzdG9tRXZlbnQ8SUh0bXhBZnRlclN3YXBEZXRhaWw+O1xuICAgIGNvbnNvbGUuaW5mbygnW1Rhc2sgRmlsdGVyc10gaHRteDphZnRlclN3YXAgZXZlbnQnLCBjdXN0b21FdmVudC5kZXRhaWwpO1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIGZpbHRlciB1cGRhdGUgKHRhcmdldCBpcyB0YXNrIGxpc3QgY29udGFpbmVyKVxuICAgIGlmIChjdXN0b21FdmVudC5kZXRhaWwudGFyZ2V0Py5pZCA9PT0gJ3Rhc2stbGlzdC1jb250YWluZXInKSB7XG4gICAgICBjb25zb2xlLmluZm8oJ1tUYXNrIEZpbHRlcnNdIFVwZGF0aW5nIFVSTCBhZnRlciBmaWx0ZXIgY2hhbmdlJyk7XG5cbiAgICAgIC8vIEdldCB0aGUgZm9ybSBlbGVtZW50XG4gICAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcnMtZm9ybScpIGFzIEhUTUxGb3JtRWxlbWVudCB8IG51bGw7XG4gICAgICBpZiAoZm9ybSA9PT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tUYXNrIEZpbHRlcnNdIEZvcm0gbm90IGZvdW5kJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU2VyaWFsaXplIGZvcm0gZGF0YSB0byBVUkwgc2VhcmNoIHBhcmFtc1xuICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSk7XG4gICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG5cbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGZvcm1EYXRhLmVudHJpZXMoKSkge1xuICAgICAgICAvLyBGb3JtRGF0YSB2YWx1ZXMgYXJlIEZpbGUgb3Igc3RyaW5nXG4gICAgICAgIGNvbnN0IHN0cmluZ1ZhbHVlID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogdmFsdWUubmFtZTtcbiAgICAgICAgaWYgKHN0cmluZ1ZhbHVlICE9PSBudWxsICYmIHN0cmluZ1ZhbHVlICE9PSAnJykge1xuICAgICAgICAgIHBhcmFtcy5hcHBlbmQoa2V5LCBzdHJpbmdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQnVpbGQgbmV3IFVSTFxuICAgICAgY29uc3QgbmV3VXJsID0gcGFyYW1zLnRvU3RyaW5nKCkgPT09ICcnID8gJy90YXNrcycgOiBgL3Rhc2tzPyR7cGFyYW1zLnRvU3RyaW5nKCl9YDtcblxuICAgICAgY29uc29sZS5pbmZvKCdbVGFzayBGaWx0ZXJzXSBOZXcgVVJMOicsIG5ld1VybCk7XG5cbiAgICAgIC8vIFVwZGF0ZSBicm93c2VyIGhpc3Rvcnkgd2l0aG91dCByZWxvYWRcbiAgICAgIGdsb2JhbFRoaXMuaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCBuZXdVcmwpO1xuICAgIH1cbiAgfSk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQVlBLFdBQVMsaUJBQWlCLG9CQUFvQixNQUFNO0FBQ2xELFlBQVEsS0FBSyx5Q0FBeUM7QUFHdEQsYUFBUyxLQUFLLGlCQUFpQixrQkFBa0IsQ0FBQyxVQUFpQjtBQUNqRSxZQUFNLGNBQWM7QUFDcEIsY0FBUSxLQUFLLHVDQUF1QyxZQUFZLE1BQU07QUFHdEUsVUFBSSxZQUFZLE9BQU8sUUFBUSxPQUFPLHVCQUF1QjtBQUMzRCxnQkFBUSxLQUFLLGlEQUFpRDtBQUc5RCxjQUFNLE9BQU8sU0FBUyxlQUFlLGNBQWM7QUFDbkQsWUFBSSxTQUFTLE1BQU07QUFDakIsa0JBQVEsS0FBSywrQkFBK0I7QUFDNUM7QUFBQSxRQUNGO0FBR0EsY0FBTSxXQUFXLElBQUksU0FBUyxJQUFJO0FBQ2xDLGNBQU0sU0FBUyxJQUFJLGdCQUFnQjtBQUVuQyxtQkFBVyxDQUFDLEtBQUssS0FBSyxLQUFLLFNBQVMsUUFBUSxHQUFHO0FBRTdDLGdCQUFNLGNBQWMsT0FBTyxVQUFVLFdBQVcsUUFBUSxNQUFNO0FBQzlELGNBQUksZ0JBQWdCLFFBQVEsZ0JBQWdCLElBQUk7QUFDOUMsbUJBQU8sT0FBTyxLQUFLLFdBQVc7QUFBQSxVQUNoQztBQUFBLFFBQ0Y7QUFHQSxjQUFNLFNBQVMsT0FBTyxTQUFTLE1BQU0sS0FBSyxXQUFXLFVBQVUsT0FBTyxTQUFTLENBQUM7QUFFaEYsZ0JBQVEsS0FBSywyQkFBMkIsTUFBTTtBQUc5QyxtQkFBVyxRQUFRLFVBQVUsQ0FBQyxHQUFHLElBQUksTUFBTTtBQUFBLE1BQzdDO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
