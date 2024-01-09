# import pygetwindow as gw

# all_window = gw.getAllTitles()

# for i in all_window:
#     print(i)

# # List of tools you need:
# # MinGW Installation Manager Setup Tool 1°
# # MinGW Installation Manager 2°    
    
# # List of actions performed:
# # Have you marked mingw32-gcc-g++?
# # Have you installed mingw32-gcc-g++?
    
# # "%PATH%;C:\Users\Giovanni\Desktop\pene\bin"

# from kivy.app import App
# from kivy.uix.label import Label
# from kivy.uix.boxlayout import BoxLayout
# from kivy.core.window import Window
# from kivy.utils import get_color_from_hex
# import webbrowser

# class LinkExample(App):
#     def build(self):
#         layout = BoxLayout(orientation='vertical', padding=10, spacing=10)
        
#         # Imposta il colore del testo e del link
#         text_color = get_color_from_hex('#FF0000')  # Rosso

#         # Creazione di un link utilizzando il widget Label
#         label_text = ""
#         link_label = Label(
#             text="[ref=my_link]Clicca qui per scaricare MinGW[/ref]",
#             markup=True,
#             color=text_color,
#             on_ref_press=self.on_link_press
#         )

#         # Aggiungi il widget Label al layout
#         layout.add_widget(link_label)

#         return layout

#     def on_link_press(self, instance, value):
#         # Funzione chiamata quando il link viene premuto
#         if value == 'my_link':
#             webbrowser.open("https://sourceforge.net/projects/mingw/")

# if __name__ == '__main__':
#     LinkExample().run()


from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.checkbox import CheckBox


class CheckBoxApp(App):
    def build(self):
        # Create a BoxLayout
        layout = BoxLayout(orientation='vertical', spacing=10, padding=10)

        # Create a CheckBox
        checkbox = CheckBox(active=False)  # By default, it's unchecked

        # Bind a function to the checkbox's state change event
        checkbox.bind(active=self.on_checkbox_active)

        # Add the checkbox to the layout
        layout.add_widget(checkbox)

        return layout

    def on_checkbox_active(self, checkbox_instance, value):
        if value:
            print("Checkbox is checked")
        else:
            print("Checkbox is unchecked")


if __name__ == '__main__':
    CheckBoxApp().run()



