// Evento click para copyOutputBtn (copiar el contenido de outputHtml al portapapeles)
document.addEventListener('DOMContentLoaded', function() {
	var copyOutputBtn = document.getElementById('copyOutputBtn');
	if (copyOutputBtn) {
		copyOutputBtn.addEventListener('click', function() {
			var outputHtml = document.getElementById('outputHtml');
			if (outputHtml) {
				// Crear un textarea temporal para copiar solo el texto plano
				var temp = document.createElement('textarea');
				temp.value = outputHtml.innerText;
				document.body.appendChild(temp);
				temp.select();
				document.execCommand('copy');
				document.body.removeChild(temp);
			}
		});
	}
});
// Evento click para makeMyWorkBtn (genera el texto de configuración)
document.addEventListener('DOMContentLoaded', function() {
	var makeMyWorkBtn = document.getElementById('makeMyWorkBtn');
	if (makeMyWorkBtn) {
		makeMyWorkBtn.addEventListener('click', function() {
			const vlanMGMTEnd = document.getElementById('vlanMGMTEnd').value;
			const vlanEnd = document.getElementById('vlanEnd').value;
			const ipMGMTCpeEnd = document.getElementById('ipMGMTCpeEnd').value;
			const cpeEnd = document.getElementById('cpeEnd').value;
			const serviceId = document.getElementById('serviceId').value;
			const vrf = document.getElementById('vrf').value;
			const asnSource = document.getElementById('asnSource').value;
			const asnEnd = document.getElementById('asnEnd').value; 
			const ipiBGPvrf = document.getElementById('ipiBGPvrf').value;
			const deviceAccessEnd = document.getElementById('deviceAccessEnd').value;
			const portAccessEnd = document.getElementById('portAccessEnd').value;
			const ipDeviceAccessEnd = document.getElementById('ipDeviceAccessEnd').value;
			const ipWANCus = document.getElementById('ipWANCus').value;    
			const last2 = vlanMGMTEnd.slice(-2);

			// Calcular el gateway .1 de la red /24
			let gwMGMTCpeEnd = '';
			if (ipMGMTCpeEnd) {
				const octets = ipMGMTCpeEnd.split('.');
				if (octets.length === 4) {
					gwMGMTCpeEnd = `${octets[0]}.${octets[1]}.${octets[2]}.1`;
				}
			}

			// Calcular ipiBGPPeerLocal sumando 2 al último octeto de ipiBGPvrf
			let ipiBGPPeerLocal = '';
			if (ipiBGPvrf) {
				const octets = ipiBGPvrf.split('.');
				if (octets.length === 4) {
					const last = parseInt(octets[3], 10);
					if (!isNaN(last)) {
						ipiBGPPeerLocal = `${octets[0]}.${octets[1]}.${octets[2]}.${last + 2}`;
					}
				}
			}

			// Calcular ipiBGPPeerRemote sumando 1 al último octeto de ipiBGPvrf
			let ipiBGPPeerRemote = '';
			if (ipiBGPvrf) {
				const octets = ipiBGPvrf.split('.');
				if (octets.length === 4) {
					const last = parseInt(octets[3], 10);
					if (!isNaN(last)) {
						ipiBGPPeerRemote = `${octets[0]}.${octets[1]}.${octets[2]}.${last + 1}`;
					}
				}
			}

			// Calcular ipWANCusLocal sumando 1 al último octeto de ipWANCus
			let ipWANCusLocal = '';
			if (ipWANCus) {
				const octets = ipWANCus.split('.');
				if (octets.length === 4) {
					const last = parseInt(octets[3], 10);
					if (!isNaN(last)) {
						ipWANCusLocal = `${octets[0]}.${octets[1]}.${octets[2]}.${last + 1}`;
					}
				}
			}

			const texto = `
su
1234
configure port
        svi <span id="value">${last2}</span>
        name FN:MGT-AG:HN<span id="value">${last2}</span>
        no shutdown
exit all
configure port
	    ethernet 0/1
	    name NNI-FN:TRK-TC:FO-EV:<span id="value">${deviceAccessEnd}</span>-PV:<span id="value">${portAccessEnd}</span>-DE:<span id="value">${ipDeviceAccessEnd}</span>
	    egress-mtu 12288
        no shutdown
    exit
		ethernet 0/2
		shutdown
	exit
		ethernet 0/3
		name UNI-IDU:<span id="value">${serviceId}</span>-DE:CUS-PLACE
		egress-mtu 12288
        no shutdown
	exit
		ethernet 0/4
		shutdown
	exit
	    ethernet 0/5
		shutdown
	exit
	    ethernet 0/6
		shutdown
exit all
configure flows
		classifier-profile vlan<span id="value">${vlanMGMTEnd}</span> match-any
		match vlan <span id="value">${vlanMGMTEnd}</span>
	exit
	flow UFI-MGT
		classifier mng_all
			vlan-tag push vlan <span id="value">${vlanMGMTEnd}</span> p-bit fixed 0
			ingress-port svi <span id="value">${last2}</span>
			egress-port ethernet 0/1 queue 0 block 0/1
			no shutdown
	exit
	flow UFI-IN
			classifier vlan<span id="value">${vlanMGMTEnd}</span>
			vlan-tag pop vlan
			ingress-port ethernet 0/1
			egress-port svi <span id="value">${last2}</span>
			no shutdown
exit all
configure router 1
	interface 30
		address <span id="value">${ipMGMTCpeEnd}</span>/24
		bind svi <span id="value">${last2}</span>
		exit
		static-route 0.0.0.0/0 address <span id="value">${gwMGMTCpeEnd}</span>
exit all
configure access-control access-list MGMT
		permit ip 10.200.25.0/24 any sequence 10
		permit ip 10.200.26.0/24 any sequence 20
		permit ip 10.250.55.0/24 any sequence 30
		permit ip 10.40.6.0/24 any sequence 40
		permit ip 10.41.0.0/24 any sequence 50
		permit ip 169.254.0.0/16 any sequence 60
		permit ip any any sequence 100
exit all
configure system
		name <span id="value">${cpeEnd}</span>
		syslog device
		severity-level warning
	exit
		syslog server 1
		address 10.250.55.224
		accounting commands
		no shutdown
	exit
		syslog server 2
		address 10.109.144.41
		accounting commands
    	no shutdown
exit all
configure management snmp
		snmp-engine-id mac 18-06-F5-8C-15-A1
		community read
		name ufinet
		sec-name v2_read
    	no shutdown
	exit
		community read1
		name uf1c0l
		sec-name v2_read
		no shutdown
	exit
		community trap
		name ufinet
		sec-name v2_trap
		no shutdown
	exit
		community write
		name pnrw-all
		sec-name v2_write
		no shutdown
	exit
		target-params snmpv2c
		message-processing-model snmpv2c
		version snmpv2c
		security name v2_write level no-auth-no-priv
		no shutdown
	exit
		target Ufinet
		target-params snmpv2c
		address udp-domain 10.109.210.10
		no shutdown
	exit
		target Ufinet1
		target-params snmpv2c
		address udp-domain 10.109.185.39
		no shutdown
exit all
configure management access
		auth-policy 1st-level tacacs+
	exit
		tacacsplus
		group ADMIN
		accounting shell system commands
	exit
		server 10.109.3.33
		key B072DF7D5784227CB80D1518ED0007A3 hash
    	group ADMIN
		no shutdown
	exit
		server 10.250.55.168
		key B072DF7D5784227CB80D1518ED0007A3 hash
		group ADMIN
		no shutdown
	exit
exit
        management-address ipv4 <span id="value">${ipMGMTCpeEnd}</span>
exit all
configure port
		svi 2
    		name <span id="value">${serviceId}</span>-BGP
	    	no shutdown
		exit
		svi 3
			name <span id="value">${serviceId}</span>-WAN
			no shutdown
exit all
configure flows 
		classifier-profile vlan<span id="value">${vlanEnd}</span> match-any
		    match vlan <span id="value">${vlanEnd}</span>
	exit
		flow <span id="value">${serviceId}</span>-BGP-IN
		    classifier vlan<span id="value">${vlanEnd}</span>
		    no policer
		    vlan-tag pop vlan
		    ingress-port ethernet 0/1
		    egress-port svi 2
		    no shutdown
	exit
		flow <span id="value">${serviceId}</span>-BGP-OUT
	    	classifier mng_all
    		no policer
		    vlan-tag push vlan <span id="value">${vlanEnd}</span> p-bit fixed 0
		    ingress-port svi 2
		    egress-port ethernet 0/1 queue 0 block 0/1
		    no shutdown
	exit
		flow <span id="value">${serviceId}</span>-WAN-IN
			classifier mng_untagged
			no policer
			no vlan-tag
			ingress-port ethernet 0/3
			egress-port svi 3
			no shutdown
	exit
		flow <span id="value">${serviceId}</span>-WAN-OUT
			classifier mng_untagged
			no policer
			no vlan-tag
			ingress-port svi 3
			egress-port ethernet 0/3 queue 0 block 0/1
			no shutdown
exit all
configure router 2
		name <span id="value">${vrf}</span>
    		interface 2
        		address <span id="value">${ipiBGPPeerLocal}</span>/30
		    	bind svi 2
			    no shutdown
	exit
	        interface 3
			    address <span id="value">${ipWANCusLocal}</span>/30
			    bind svi 3
			    no shutdown
	exit
		static-route <span id="value">${ipWANCus}</span>/30 address <span id="value">${ipWANCusLocal}</span> install
		bgp <span id="value">${asnEnd}</span>
		    router-id <span id="value">${ipiBGPPeerLocal}</span>
			no shutdown
			neighbor <span id="value">${ipiBGPPeerRemote}</span>
			max-prefixes 20000
			remote-as <span id="value">${asnSource}</span>
			no shutdown
	exit
		ipv4-unicast-af
			network <span id="value">${ipWANCus}</span>/30
			redistribute static
			neighbor <span id="value">${ipiBGPPeerRemote}</span>
			active
exit all
save`;
			// Mostrar el resultado en un <pre id="outputHtml"> usando innerHTML para que los spans sean visibles
			var outputHtml = document.getElementById('outputHtml');
			if (!outputHtml) {
				outputHtml = document.createElement('pre');
				outputHtml.id = 'outputHtml';
				var outputText = document.getElementById('outputText');
				if (outputText && outputText.parentNode) {
					outputText.parentNode.insertBefore(outputHtml, outputText.nextSibling);
				} else {
					document.body.appendChild(outputHtml);
				}
			}
			outputHtml.innerHTML = texto;
			// Opcional: también seguir llenando el textarea con el texto plano sin HTML
			document.getElementById('outputText').value = texto.replace(/<[^>]+>/g, '');
		});
	}
});
// Evento click para extractBtn (extraer datos del PDF y llenar el formulario)
document.addEventListener('DOMContentLoaded', function() {
	var extractBtn = document.getElementById('extractBtn');
	if (extractBtn) {
		extractBtn.addEventListener('click', async function() {
			const fileInput = document.getElementById('pdfInput');
			const pdfText = document.getElementById('pdfText');
			if (!fileInput.files.length) {
				pdfText.textContent = 'Please choose a L3 service Phoenix PDF.';
				return;
			}
			const file = fileInput.files[0];
			const reader = new FileReader();
			reader.onload = async function() {
				const typedarray = new Uint8Array(reader.result);
				const pdf = await pdfjsLib.getDocument(typedarray).promise;
				let text = '';
				for (let i = 1; i <= pdf.numPages; i++) {
					const page = await pdf.getPage(i);
					const content = await page.getTextContent();
					text += content.items.map(item => item.str).join(' ') + '\n';
				}
				pdfText.textContent = text;
				// Extraer y llenar automáticamente los campos del formulario
				const campos = [
					{id: 'deviceAccessEnd', label: 'Device Access End', regex: /Device Access End: ([^\n]+)/},
					{id: 'ipDeviceAccessEnd', label: 'IP Device Access End', regex: /IP Device Access End: ([^\n]+)/},
					{id: 'portAccessEnd', label: 'Port Access End', regex: /Port Access End: ([^\n]+)/},
					{id: 'cpeEnd', label: 'CPE End', regex: /CPE End: ([^\n]+)/},
					{id: 'ipMGMTCpeEnd', label: 'IP MGMT CPE End', regex: /IP MGMT CPE End: ([^\n]+)/},
					{id: 'vrf', label: 'VRF', regex: /VRF\s*:?\s*([^\s\n]+)/i},
					{id: 'portCpeEnd', label: 'Port CPE End', regex: /Port CPE End: ([^\n]+)/},
					{id: 'vlanMGMTEnd', label: 'Vlan MGMT End', regex: /Vlan MGMT End: ([^\n]+)/},
					{id: 'vlanEnd', label: 'Vlan End', regex: /Vlan End: ([^\n]+)/},
					{id: 'asnSource', label: 'ASN Origen', regex: /ASN Origen: ([^\n]+)/},
					{id: 'asnEnd', label: 'ASN End', regex: /ASN End: ([^\n]+)/},
					{id: 'ipiBGPvrf', label: 'Network for iBGP', regex: /Direccionamiento Público\/Privado Origen:?\s*([^\n]+)/}
				];
				let resultado = '';
				campos.forEach(campo => {
					let valor = '';
					if (campo.id === 'deviceAccessEnd') {
						// Extraer desde 'Device Access End' hasta 'QoS'
						const match = text.match(/Equipo Acceso Destino:?\s*([\s\S]*?)QoS/i);
						valor = match ? match[1].trim() : '';
					} else if (campo.id === 'ipDeviceAccessEnd') {
						// Extraer desde 'IP Device Access End' hasta 'Capacidad Burst (Mbps)'
						const match = text.match(/IP Equipo Acceso Destino:?\s*([\s\S]*?)Capacidad Burst \(Mbps\)/i);
						valor = match ? match[1].trim() : '';
					} else if (campo.id === 'portAccessEnd') {
						// Extraer desde 'Port Access End' hasta 'Precio burst por mpbs'
						const match = text.match(/Puerto Acceso Destino:?\s*([\s\S]*?)Precio burst por mpbs/i);
						valor = match ? match[1].trim() : '';
					} else if (campo.id === 'cpeEnd') {
						// Extraer desde 'CPE End' hasta 'QoS Burst'
						const match = text.match(/CPE Destino:?\s*([\s\S]*?)QoS Burst/i);
						valor = match ? match[1].trim() : '';
					} else if (campo.id === 'ipMGMTCpeEnd') {
						// Extraer desde 'IP MGMT CPE End' hasta 'VRF'
						const match = text.match(/IP Gestión CPE Destino:?\s*([\s\S]*?)VRF/i);
						valor = match ? match[1].trim() : '';
					} else if (campo.id === 'portCpeEnd') {
						// Extraer desde 'Port CPE End' hasta 'VRF RD'
						const match = text.match(/Puerto CPE Destino:?\s*([\s\S]*?)VRF RD/i);
						valor = match ? match[1].trim() : '';
					} else if (campo.id === 'vlanMGMTEnd') {
						// Extraer desde 'Vlan MGMT End' hasta 'BDI'
						const match = text.match(/Vlan Gestión Destino:?\s*([\s\S]*?)BDI/i);
						valor = match ? match[1].trim() : '';
					} else if (campo.id === 'vlanEnd') {
						// Extraer desde 'Vlan End' hasta 'URL Monitoreo'
						const match = text.match(/Vlan Destino:?\s*([\s\S]*?)URL Monitoreo/i);
						valor = match ? match[1].trim() : '';
					} else if (campo.id === 'asnSource') {
						// Extraer desde 'ASN Origen' hasta 'ASN Destino'
						const match = text.match(/ASN Origen:?\s*([\s\S]*?)ASN Destino/i);
						valor = match ? match[1].trim() : '';
					} else if (campo.id === 'asnEnd') {
						// Extraer desde 'ASN Destino' hasta 'Direccionamiento Público/Privado Origen'
						const match = text.match(/ASN Destino:?\s*([\s\S]*?)Direccionamiento P/i);
						valor = match ? match[1].trim() : '';
					} else if (campo.id === 'ipiBGPvrf') {
						// Extraer la red para iBGP después de 'Direccionamiento Público/Privado Origen:'
						const match = text.match(/Direccionamiento Público\/Privado Origen:?\s*([\s\S]*?)Direccionamiento P/i);
						valor = match ? match[1].trim() : '';
					} else {
						const match = text.match(campo.regex);
						valor = match ? match[1].trim() : '';
					}
					resultado += campo.label + ': ' + valor + '\n';
					// Llenar el campo del formulario si existe
					const input = document.getElementById(campo.id);
					if (input) input.value = valor;
				});
				document.getElementById('valoresExtraidos').textContent = resultado;
			};
			reader.readAsArrayBuffer(file);
		});
	}
});
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
