'use strict';
(() => {
  // src/frontend/utils/task-card-click.ts
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (event) => {
      const target = event.target;
      const taskCard = target.closest('.task-card');
      if (taskCard === null) return;
      const isActionClick =
        target.closest('.task-card-action') !== null ||
        target.closest('.dropdown-content') !== null ||
        target.closest('button[hx-post]') !== null ||
        target.closest('button[hx-delete]') !== null;
      if (isActionClick) return;
      const taskUrl = taskCard.dataset.taskUrl;
      if (taskUrl !== void 0) {
        globalThis.location.href = taskUrl;
      }
    });
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL2Zyb250ZW5kL3V0aWxzL3Rhc2stY2FyZC1jbGljay50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBUYXNrIENhcmQgQ2xpY2sgSGFuZGxlclxuICpcbiAqIE1ha2VzIGVudGlyZSB0YXNrIGNhcmRzIGNsaWNrYWJsZSB3aGlsZSBwcmVzZXJ2aW5nIGFjdGlvbiBidXR0b24gZnVuY3Rpb25hbGl0eS5cbiAqIENTUC1jb21wbGlhbnQgaW1wbGVtZW50YXRpb24gdXNpbmcgZXZlbnQgZGVsZWdhdGlvbi5cbiAqL1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICAvLyBVc2UgZXZlbnQgZGVsZWdhdGlvbiBvbiB0aGUgZG9jdW1lbnQgdG8gaGFuZGxlIGR5bmFtaWNhbGx5IGxvYWRlZCBjYXJkcyAoSFRNWClcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAvLyBGaW5kIHRoZSBjbG9zZXN0IHRhc2sgY2FyZFxuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICBjb25zdCB0YXNrQ2FyZCA9IHRhcmdldC5jbG9zZXN0PEhUTUxFbGVtZW50PignLnRhc2stY2FyZCcpO1xuXG4gICAgaWYgKHRhc2tDYXJkID09PSBudWxsKSByZXR1cm47XG5cbiAgICAvLyBJZ25vcmUgY2xpY2tzIG9uIGFjdGlvbiBidXR0b25zIGFuZCB0aGVpciBjaGlsZHJlblxuICAgIGNvbnN0IGlzQWN0aW9uQ2xpY2sgPVxuICAgICAgdGFyZ2V0LmNsb3Nlc3QoJy50YXNrLWNhcmQtYWN0aW9uJykgIT09IG51bGwgfHxcbiAgICAgIHRhcmdldC5jbG9zZXN0KCcuZHJvcGRvd24tY29udGVudCcpICE9PSBudWxsIHx8XG4gICAgICB0YXJnZXQuY2xvc2VzdCgnYnV0dG9uW2h4LXBvc3RdJykgIT09IG51bGwgfHxcbiAgICAgIHRhcmdldC5jbG9zZXN0KCdidXR0b25baHgtZGVsZXRlXScpICE9PSBudWxsO1xuXG4gICAgaWYgKGlzQWN0aW9uQ2xpY2spIHJldHVybjtcblxuICAgIC8vIE5hdmlnYXRlIHRvIHRoZSB0YXNrIGRldGFpbCBwYWdlXG4gICAgY29uc3QgdGFza1VybCA9IHRhc2tDYXJkLmRhdGFzZXQudGFza1VybDtcbiAgICBpZiAodGFza1VybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBnbG9iYWxUaGlzLmxvY2F0aW9uLmhyZWYgPSB0YXNrVXJsO1xuICAgIH1cbiAgfSk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQU9BLFdBQVMsaUJBQWlCLG9CQUFvQixNQUFNO0FBRWxELGFBQVMsaUJBQWlCLFNBQVMsQ0FBQyxVQUFzQjtBQUV4RCxZQUFNLFNBQVMsTUFBTTtBQUNyQixZQUFNLFdBQVcsT0FBTyxRQUFxQixZQUFZO0FBRXpELFVBQUksYUFBYSxLQUFNO0FBR3ZCLFlBQU0sZ0JBQ0osT0FBTyxRQUFRLG1CQUFtQixNQUFNLFFBQ3hDLE9BQU8sUUFBUSxtQkFBbUIsTUFBTSxRQUN4QyxPQUFPLFFBQVEsaUJBQWlCLE1BQU0sUUFDdEMsT0FBTyxRQUFRLG1CQUFtQixNQUFNO0FBRTFDLFVBQUksY0FBZTtBQUduQixZQUFNLFVBQVUsU0FBUyxRQUFRO0FBQ2pDLFVBQUksWUFBWSxRQUFXO0FBQ3pCLG1CQUFXLFNBQVMsT0FBTztBQUFBLE1BQzdCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
