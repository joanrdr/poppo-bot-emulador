#!/bin/bash

echo "⚡⚡⚡ MODO ULTRA RÁPIDO ⚡⚡⚡"
echo ""
echo "🎯 Objetivo: 10,000 taps en ~3 minutos"
echo "⏱️  Descansos: 1-5 segundos (variados)"
echo "📍 Coordenadas: (83, 1349)"
echo ""
echo "🚀 INICIANDO EN 3 SEGUNDOS..."
sleep 3

total_taps=0
objetivo=10000
rafaga_num=1

while [ $total_taps -lt $objetivo ]; do
    # Ráfaga de 300-500 taps
    taps_rafaga=$((300 + RANDOM % 200))

    echo ""
    echo "╔═══════════════════════════════════════╗"
    echo "║  ⚡ RÁFAGA #$rafaga_num - $taps_rafaga TAPS"
    echo "╚═══════════════════════════════════════╝"

    for ((i=1; i<=taps_rafaga; i++)); do
        adb shell input tap 83 1349
        sleep 0.018  # ~55 taps/segundo
        total_taps=$((total_taps + 1))

        # Mostrar progreso cada 100 taps
        if [ $((i % 100)) -eq 0 ]; then
            porcentaje=$((total_taps * 100 / objetivo))
            echo "   ⚡ $total_taps/$objetivo taps ($porcentaje%)"
        fi

        # Si llegamos al objetivo, salir
        if [ $total_taps -ge $objetivo ]; then
            break
        fi
    done

    # Si llegamos al objetivo, salir
    if [ $total_taps -ge $objetivo ]; then
        break
    fi

    # Pausa corta variada (1-5 segundos)
    pausa=$((1 + RANDOM % 5))
    echo "   💤 Descanso: ${pausa}s..."
    sleep $pausa

    rafaga_num=$((rafaga_num + 1))
done

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║  ✅ ¡COMPLETADO!                      ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "📊 Total: $total_taps taps"
echo "⚡ Ráfagas completadas: $rafaga_num"
echo ""
echo "🎉 ¡MISIÓN CUMPLIDA!"
