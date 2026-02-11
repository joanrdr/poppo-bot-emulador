#!/bin/bash
echo "🌸 PROBANDO COORDENADAS: X=83, Y=1349"
echo ""
echo "Haciendo 50 taps rápidos..."
echo "MIRA EL EMULADOR para ver el contador"
echo ""
sleep 1

for i in {1..50}; do
    adb shell input tap 83 1349
    sleep 0.08
done

echo ""
echo "✅ 50 taps completados"
echo ""
echo "¿Viste el contador (x50, x60, etc.)?"
