/**
 * HTMX Custom Events Handler
 * Handles custom HTMX events like task count updates
 */

document.addEventListener('DOMContentLoaded', function () {
  // Listen for task count updates
  document.body.addEventListener('updateTaskCount', function (event) {
    const detail = event.detail;
    if (detail && typeof detail.total === 'number') {
      const taskCountElement = document.getElementById('task-count');
      if (taskCountElement) {
        taskCountElement.textContent = detail.total + ' tâche(s) au total';
      }
    }
  });

  // Listen for task creation events
  document.body.addEventListener('taskCreated', function (event) {
    // Could show a toast notification or refresh the task list
    console.log('Task created successfully');
  });

  // Listen for task update events
  document.body.addEventListener('taskUpdated', function (event) {
    console.log('Task updated successfully');
  });

  // Listen for task deletion events
  document.body.addEventListener('taskDeleted', function (event) {
    console.log('Task deleted successfully');
  });
});
