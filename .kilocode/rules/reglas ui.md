# reglas ui.md

frontend y deseño ui/ux 

## Directrices

# 📐 Reglas de UI Frontend con Tailwind CSS + ShadCN UI

## 🎯 Objetivo

Diseñar interfaces modernas, elegantes y únicas, usando **Tailwind CSS** y **ShadCN UI**, con enfoque **mobile-first**, garantizando una excelente experiencia en dispositivos móviles y escalabilidad hacia pantallas más grandes.

---

## 🧱 1. Estructura y Diseño Base

- **Mobile First:** Comienza siempre diseñando para pantallas pequeñas (`sm`) y escala hacia `md`, `lg`, `xl`.
- Usa el sistema de breakpoints de Tailwind para adaptar los layouts:  
  `sm:` → móviles, `md:` → tablets, `lg:` → laptops, `xl:` → desktop grandes.

```html
<div class="p-4 sm:p-6 lg:p-8">
  <!-- contenido -->
</div>
Mantén una jerarquía clara de layout con flex, grid, y container de Tailwind.

Aprovecha el sistema de espaciado (space-x, space-y, gap) para mantener consistencia visual.

🎨 2. Estética y Personalización
Personaliza componentes de ShadCN UI para que no se vean genéricos. Utiliza className con Tailwind para modificar estilos según la marca.

tsx
Copiar código
<Button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md hover:scale-105 transition" />
Aplica colores de marca usando el archivo tailwind.config.ts extendiendo la paleta:

ts
Copiar código
theme: {
  extend: {
    colors: {
      brand: {
        primary: '#4f46e5',
        secondary: '#9333ea',
      },
    },
  },
}
Usa fuentes y tipografías elegantes (font-serif, font-medium, tracking-wide, etc).

Evita el uso excesivo de sombras y bordes. Usa shadow-sm, rounded-lg con moderación.

🧩 3. Componentes con ShadCN UI
Usa los componentes de ShadCN UI como base, pero siempre con personalización Tailwind.

Prioriza accesibilidad (aria-*, roles), usabilidad y consistencia.

Agrupa componentes en patrones reutilizables.

tsx
Copiar código
<Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl">
  <CardHeader>
    <CardTitle className="text-lg font-semibold text-gray-900">Título</CardTitle>
  </CardHeader>
  <CardContent className="text-sm text-gray-700">
    Contenido aquí
  </CardContent>
</Card>
📱 4. Responsividad y Adaptabilidad
Usa clases responsivas: text-sm sm:text-base lg:text-lg, grid-cols-1 md:grid-cols-2.

Asegúrate que todos los componentes escalen correctamente en pantallas pequeñas.

Usa overflow-x-auto y scroll-mx-* en sliders o contenedores horizontales.

⚡ 5. Animaciones y Transiciones
Usa transiciones sutiles (transition, duration-200, ease-in-out) para mejorar experiencia.

Aprovecha hover:, focus:, active: para microinteracciones.

Usa @tailwindcss/animate si se requiere animaciones complejas.

html
Copiar código
<button class="transition-transform hover:scale-105 duration-200 ease-in-out">
  Hover Me
</button>
💡 6. Buenas Prácticas
Componentes reutilizables y bien nombrados.

Usa clsx o cn() para condicionar clases dinámicamente en React.

No sobrescribas estilos innecesariamente; extiende con Tailwind.

Prefiere utilidad clara antes que complejidad visual innecesaria.

Mantén un diseño limpio, legible, funcional y con intención estética clara.

✅ 7. Checklist de Calidad UI
 Diseño mobile-first

 Componentes personalizados con identidad visual

 Colores y tipografías de marca aplicados

 Animaciones sutiles y efectivas

 Escalabilidad hacia desktop confirmada

 Accesibilidad y usabilidad probadas

 Layouts consistentes y sin ruido visual

🛠️ Herramientas recomendadas
Tailwind CSS

ShadCN UI

Lucide Icons

tailwind-variants (opcional)

clsx o cn() helper para clases condicionales

tailwind.config.ts personalizado para branding