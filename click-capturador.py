#!/usr/bin/env python3
"""
Servidor simple para capturar click en imagen
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse

# Coordenadas capturadas
coordenadas_guardadas = None

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Marca el Botón de la Rosa</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #1a1a1a;
            color: #fff;
            font-family: monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        h1 { color: #ff69b4; }
        .container {
            position: relative;
            display: inline-block;
            border: 3px solid #ff69b4;
            cursor: crosshair;
        }
        img { display: block; max-width: 90vw; height: auto; }
        .marca {
            position: absolute;
            width: 60px;
            height: 60px;
            border: 3px solid #00ff00;
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            animation: pulse 1s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.2); }
        }
        .info {
            background: #2a2a2a;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            font-size: 18px;
        }
        .info.activo {
            background: #00ff00;
            color: #000;
            font-weight: bold;
        }
        button {
            background: #ff69b4;
            color: #fff;
            border: none;
            padding: 15px 30px;
            font-size: 18px;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px;
            font-family: monospace;
        }
        button:hover { background: #ff1493; }
    </style>
</head>
<body>
    <h1>🌸 HAZ CLICK EN EL BOTÓN DE LA ROSA</h1>
    <div class="container" id="container">
        <img src="/imagen" id="imagen">
        <div id="marca" class="marca" style="display: none;"></div>
    </div>
    <div class="info" id="info">
        Haz click exactamente en el centro del botón de la rosa 🌸
    </div>
    <button onclick="guardar()" id="btnGuardar" style="display:none">
        💾 GUARDAR COORDENADAS
    </button>

    <script>
        let coordX = null, coordY = null;
        const img = document.getElementById('imagen');
        const marca = document.getElementById('marca');
        const info = document.getElementById('info');
        const container = document.getElementById('container');

        container.addEventListener('click', function(e) {
            const rect = img.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            // Calcular coordenadas reales (1080x2400)
            const realX = Math.round((clickX / img.offsetWidth) * 1080);
            const realY = Math.round((clickY / img.offsetHeight) * 2400);

            coordX = realX;
            coordY = realY;

            // Mostrar marca
            marca.style.display = 'block';
            marca.style.left = clickX + 'px';
            marca.style.top = clickY + 'px';

            // Actualizar info
            info.className = 'info activo';
            info.innerHTML = `✅ BOTÓN MARCADO<br>📍 X=${realX}, Y=${realY}`;

            // Mostrar botón guardar
            document.getElementById('btnGuardar').style.display = 'inline-block';
        });

        function guardar() {
            if (coordX === null || coordY === null) {
                alert('Primero haz click en el botón');
                return;
            }

            fetch('/guardar', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({x: coordX, y: coordY})
            }).then(r => r.json()).then(data => {
                alert('✅ COORDENADAS GUARDADAS!\\n\\nX=' + coordX + ', Y=' + coordY +
                      '\\n\\nPresiona Ctrl+C en la terminal para continuar.');
            });
        }
    </script>
</body>
</html>
"""

class ClickHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suprimir logs

    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(HTML_TEMPLATE.encode())
        elif self.path == '/imagen':
            self.send_response(200)
            self.send_header('Content-type', 'image/png')
            self.end_headers()
            with open('/tmp/marcar.png', 'rb') as f:
                self.wfile.write(f.read())

    def do_POST(self):
        global coordenadas_guardadas
        if self.path == '/guardar':
            length = int(self.headers['Content-Length'])
            data = json.loads(self.rfile.read(length))
            coordenadas_guardadas = (data['x'], data['y'])

            print(f"\n✅ COORDENADAS CAPTURADAS:")
            print(f"   X = {data['x']}")
            print(f"   Y = {data['y']}")
            print(f"\nPresiona Ctrl+C para continuar...")

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True}).encode())

if __name__ == '__main__':
    print("\n╔═══════════════════════════════════════════════╗")
    print("║  🌸 MARCADOR DE BOTÓN - SERVIDOR ACTIVO      ║")
    print("╚═══════════════════════════════════════════════╝\n")
    print("📍 Abriendo navegador en http://localhost:8000")
    print("\nINSTRUCCIONES:")
    print("1. Se abrirá tu navegador automáticamente")
    print("2. Haz CLICK exactamente en el botón de la rosa")
    print("3. Presiona 'GUARDAR COORDENADAS'")
    print("4. Vuelve aquí y presiona Ctrl+C\n")

    import webbrowser
    import threading
    threading.Timer(1, lambda: webbrowser.open('http://localhost:8000')).start()

    server = HTTPServer(('localhost', 8000), ClickHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Servidor detenido")
        if coordenadas_guardadas:
            print(f"\n✅ Coordenadas guardadas: X={coordenadas_guardadas[0]}, Y={coordenadas_guardadas[1]}")
            # Guardar en archivo
            with open('/tmp/coordenadas.txt', 'w') as f:
                f.write(f"{coordenadas_guardadas[0]},{coordenadas_guardadas[1]}")
        server.shutdown()
