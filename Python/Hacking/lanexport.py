from kivy.app import App
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.boxlayout import BoxLayout
import socket

class App(App):
    def build(self):
        layout = BoxLayout(orientation='vertical')
        self.label = Label(text='LANEXPORT', font_size=42)
        button = Button(text='seleziona il file', size_hint=(1, 1), font_size=40)
        button.bind(on_press=self.press_dio)
        layout.add_widget(self.label)
        layout.add_widget(button)
        return layout
    
    def press_dio(self, instance):
        self.label.text = 'dio'


if __name__ == "__main__":
    App().run()