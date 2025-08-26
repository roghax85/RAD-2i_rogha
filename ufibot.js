// Validar Service ID y habilitar pdfInput
document.addEventListener('DOMContentLoaded', function() {
	const serviceIdInput = document.getElementById('serviceId');
	const pdfInput = document.getElementById('pdfInput');
	if (serviceIdInput && pdfInput) {
		serviceIdInput.addEventListener('input', function() {
			const value = serviceIdInput.value.toUpperCase();
			serviceIdInput.value = value;
			const valid = value.length === 16 && value.endsWith('C');
			pdfInput.disabled = !valid;
			serviceIdInput.setCustomValidity(valid ? '' : 'Service ID debe tener 16 caracteres y terminar en C');
		});
	}
});
