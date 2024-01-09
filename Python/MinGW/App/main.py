from kivy_lib import *
from logic import *

list_text_name = 'Style/freeroad/Freeroad Italic.ttf'
continue_text_name = 'Style/freeroad/Freeroad Italic.ttf'

def Lab(t, y):
    lab = Label(
            text = '[b]'+t+'[/b]',
            markup = True,
            font_size = 18,
            color = get_color_from_hex('#000000'),
            size_hint = (0.3, 0.2), 
            pos_hint = {'x':0.1, 'y':y},
            )
    
    return lab

def Check(v, y):
    check = CheckBox(
        active = v, 
        size = (50, 50),
        size_hint = (None, None), 
        pos_hint = {'x':0.5, 'y':y},
        color = get_color_from_hex('#FFFFFFFF')
        )

    return check

class Main(App):
    setup_checked = False
    manager_checked = False
    mark_checked = False
    install_checked = False
    path_checked = False
    
    def build(self):
        self.title = "MinGW Assistant"

        layout = FloatLayout(size=(Window.width, Window.height))

        with layout.canvas.before:
            Color(0x66 / 255.0, 0x66 / 255.0, 0x66 / 255.0, 1.0)
            self.rect = Rectangle(size=layout.size, pos=layout.pos)

        # Label: List of tool 
        label = Label(
            text = 'List of tools you need:', 
            color = get_color_from_hex('#CC0000'),
            size_hint = (0.1, 0.2), 
            pos_hint = {'x':0.1, 'y':0.83}, 
            font_name = list_text_name,
            font_size = 24
            )
        
        layout.add_widget(label) 

        # Label and checkbox: Setup Tool 
        label = Lab('MinGW Installation Manager Setup Tool --->', 0.8)
        checbox = Check(self.setup_checked, 0.87)
        
        checbox.bind(active=self.on_checksetup_active)

        layout.add_widget(label)
        layout.add_widget(checbox)
        
        # Label and checkbox: Manager 
        label = Lab('MinGW Installation Manager --->', 0.75)
        checbox = Check(self.manager_checked, 0.81)

        checbox.bind(active=self.on_checkmanager_active)
        
        layout.add_widget(label)
        layout.add_widget(checbox)
        
        # Label: List of actions 
        label = Label(
            text = 'List of actions performed:', 
            color = get_color_from_hex('#CC0000'),
            size_hint = (0.1, 0.2), 
            pos_hint = {'x':0.1, 'y':0.67}, 
            font_name = list_text_name,
            font_size = 24
            )
        
        layout.add_widget(label) 
        
        # Label and checkbox: Mark Gcc 
        label = Lab('Have you marked mingw32-gcc-g++? --->', 0.64)
        checbox = Check(self.mark_checked, 0.71)

        checbox.bind(active=self.on_checkmark_active)

        layout.add_widget(label)
        layout.add_widget(checbox)

        # Label and checkbox: Install Gcc 
        label = Lab('Have you installed mingw32-gcc-g++? --->', 0.587)
        checbox = Check(self.install_checked, 0.657)

        checbox.bind(active=self.on_checkinstall_active)

        layout.add_widget(label)
        layout.add_widget(checbox)

        # Label and checkbox: Path bin
        label = Lab('Did you put g++/bin in your environment variables? --->', 0.537)
        checbox = Check(self.path_checked, 0.607)

        checbox.bind(active=self.on_checkpath_active)

        layout.add_widget(label)
        layout.add_widget(checbox)

        # Label: Util Link
        label = Label(
            text = 'List of useful links:', 
            color = get_color_from_hex('#CC0000'),
            size_hint = (0.1, 0.2), 
            pos_hint = {'x':0.1, 'y':0.47}, 
            font_name = list_text_name,
            font_size = 24
            )
        
        layout.add_widget(label)

        # Label and Button: Link web site download MinGW
        label = Lab('Website link to download MinGW --->', 0.43)
        Download = Button(
            text = 'Download MinGW',
            outline_width = 1,
            outline_color = get_color_from_hex('000000'),
            size_hint = (0.2, 0.05),
            pos_hint = {'x':0.45, 'y':0.51},
            on_press = self.on_download_press
            )

        layout.add_widget(label)
        layout.add_widget(Download)

        # Label and Button: Link web site download MinGW
        label = Lab('Website link for video tutorial --->', 0.371)
        Video = Button(
            text = 'Video tutorial',
            outline_width = 1,
            outline_color = get_color_from_hex('000000'),
            size_hint = (0.2, 0.05),
            pos_hint = {'x':0.45, 'y':0.45},
            on_press = self.on_video_press
            )

        layout.add_widget(label)
        layout.add_widget(Video)

        # Button: Continue button
        Continue = Button(
            text = 'Continue',
            font_size = 60,
            font_name = continue_text_name,
            outline_width = 2,
            outline_color = get_color_from_hex('000000'),
            background_color = get_color_from_hex('#00ccff'),
            size_hint = (0.8, 0.15),
            pos_hint = {'x':0.1, 'y':0.2}
            )

        Continue.bind(on_press=self.on_continue_press)

        layout.add_widget(Continue)
        
        return layout

    # Logic checkbox
    def on_checksetup_active(self, checkbox_instance, value):
        self.setup_checked = value

    def on_checkmanager_active(self, checkbox_instance, value):
        self.manager_checked = value

        if value:
            self.setup_checked = True
        
        else:
            self.setup_checked = False

    def on_checkmark_active(self, checkbox_instance, value):
        self.mark_checked = value

    def on_checkinstall_active(self, checkbox_instance, value):
        self.install_checked = value

    def on_checkpath_active(self, checkbox_instance, value):
        self.path_checked = value

    # Metodo per il pulsante Download
    def on_download_press(self, instance):
        WebSite('https://sourceforge.net/projects/mingw/')

    # Metodo per il pulsante Video
    def on_video_press(self, instance):
        WebSite('https://www.youtube.com/watch?v=FEeFG9OR-QU&t=1s&ab_channel=GeekyScript')

    # I passaggi spuntati veerrano saltati: label da aggiungere
        
    # Metodo per il pulsante Continue
    def on_continue_press(self, instance):
        if not self.path_checked:
            if not self.install_checked:
                if not self.mark_checked:
                    if not self.manager_checked:
                        if not self.setup_checked:
                            SetUp()

                        Manager()

                    Mark()

                Install()

            Path()

        else:
            print('Completo')

        print('------------------')
        
if __name__ == '__main__':
    Main().run()