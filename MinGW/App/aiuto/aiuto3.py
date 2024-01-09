from kivy.app import App
from kivy.uix.label import Label
from kivy.uix.boxlayout import BoxLayout
from kivy.graphics import Color, RoundedRectangle

class MyApp(App):
    def build(self):
        # Crea un'etichetta senza sfondo o bordo
        label = Label(
            text='Etichetta Colorata con Bordo',
            size_hint=(None, None),
            size=(300, 100),
            pos_hint={'center_x': 0.5, 'center_y': 0.5},
            color=(0, 0, 0, 1),  # Colore del testo
        )

        # Aggiungi uno sfondo colorato all'etichetta
        with label.canvas.before:
            Color(0.2, 0.7, 0.3, 1)  # Colore RGB con opacità (valori compresi tra 0 e 1)
            self.rect = RoundedRectangle(pos=label.pos, size=label.size)

        # Crea un layout per contenere l'etichetta
        layout = BoxLayout(orientation='vertical', spacing=10, padding=10)
        layout.add_widget(label)

        # Aggiorna la posizione e le dimensioni del rettangolo quando cambiano
        def update_rect(instance, value):
            self.rect.pos = instance.pos
            self.rect.size = instance.size

        label.bind(pos=update_rect, size=update_rect)

        # Imposta size_hint_y su None per mantenere l'altezza fissa
        label.size_hint_y = None

        return layout

# Esegui l'applicazione
if __name__ == '__main__':
    MyApp().run()
