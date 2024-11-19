// alertSystem.js
export const alertSystem = (function() {
    // Uyarı konteynerini otomatik olarak sayfaya ekler
    function createAlertContainer() {
      let alertContainer = document.getElementById('alert-container');
      if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'position-fixed top-0 end-0 p-3';
        alertContainer.style.zIndex = '1100';
        document.body.appendChild(alertContainer);
      }
      return alertContainer;
    }

    function showAlert(message, type = 'danger', timeout = 5000) {
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
      alertDiv.role = 'alert';
      alertDiv.style.zIndex = '4';
      alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;

      // Alert container'a ekle
      const alertContainer = createAlertContainer();
      alertContainer.appendChild(alertDiv);

      // Alert için zamanlayıcı ekle
      setTimeout(() => {
        // Alert'i gizle
        alertDiv.classList.remove('show');
        alertDiv.classList.add('fade');  // Use fade instead of hide
        setTimeout(() => alertDiv.remove(), 1500); // Animasyon bitiminden sonra kaldır
      }, timeout);
   }

    return {
      showAlert
    };
  })();
