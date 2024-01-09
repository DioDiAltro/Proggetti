import pyautogui as py
import os
import ctypes
import pygetwindow as gw
import cv2
import numpy as np

def Folder():
    #Ottieni il percorso della cartella Desktop
    desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")

    #Nome della nuova cartella
    folder_name = "MinGW"  

    # Crea il percorso completo della nuova cartella
    folder_path = os.path.join(desktop_path, folder_name)

    #Controlla se la cartella esiste già
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)  # Crea la cartella se non esiste
        print(f"Cartella '{folder_name}' creata sul desktop.")
        
    else:
        print(f"La cartella '{folder_name}' esiste già sul desktop.")    

    return folder_path

def Admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin() == 0
    
    except:
        return False

def MoveCV(t, Img, Win):
    py.sleep(t)
    reference_image_cv2 = cv2.imread(Img)
    window = gw.getWindowsWithTitle(Win)[0]

    window.activate()

    X, Y, W, H = window.left, window.top, window.width, window.height

    while True:
        # Cattura uno screenshot dello schermo
        screenshot = py.screenshot(region=(X, Y, W, H))

        # Converte lo screenshot di PIL in un array numpy
        screenshot_np = np.array(screenshot)

        # Converte l'array numpy in un'immagine OpenCV
        screenshot_cv2 = cv2.cvtColor(screenshot_np, cv2.COLOR_RGB2BGR)

        # Cerca la posizione dell'immagine di riferimento nello screenshot
        result = cv2.matchTemplate(screenshot_cv2, reference_image_cv2, cv2.TM_CCOEFF_NORMED)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

        if max_val > 0.9:  # Puoi regolare la soglia in base alle tue esigenze
            # La corrispondenza è stata trovata, clicca sulla posizione
            x, y = max_loc
            if not Img == 'Gcc.png':
                py.click(x, y)

            else:
                py.rightClick(x, y)

            break

def MoveTab(t, x):
    py.sleep(t)
    py.press('tab', presses=x)
    py.press('enter')

if __name__ == '__main__':
    folder_path = Folder()
    url = 'https://sourceforge.net/projects/mingw/'
    username = os.getlogin()

    #Open chrome on MinGW Site
    os.system(f'start chrome {url}')
    MoveCV(2, "Livello3\\Download.png", "Google Chrome")
    
    #Wait download MinGW and open
    py.sleep(60+5)
    os.chdir(f'C:/Users/{username}/Downloads')
    os.system('start mingw-get-setup')

    #Click Install
    MoveTab(2, 0)

    #Check if the User is Admin 
    py.sleep(2)
    if not Admin():
        #Click change
        MoveTab(2, 3)

        #Change dir
        py.press('tab')
        py.sleep(0.5)
        py.hotkey('ctrl', 'a')
        py.sleep(0.5)
        py.press('delete')
        py.sleep(0.5)
        py.typewrite(folder_path)
        py.press('enter')

    #Click continue
    MoveTab(1, 0)

    #Wait and click continue
    MoveTab(120, 0)
    
    #MinGW Installer
    #Clic Gcc
    MoveCV(2, "Livello3\\Gcc.png", "MinGW Installation Manager")

    #Click Mark for Installation
    MoveCV(2, "Livello3\\Mark.png", "MinGW Installation Manager")

    #Click Installation 
    MoveCV(2, "Livello3\\Installation.png", "MinGW Installation Manager")

    #Click Apply Changes
    MoveCV(2, "Livello3\\Apply.png", "MinGW Installation Manager")

    #Click Apply
    MoveTab(1, 0)

    #Click Close
    MoveTab(300, 0)

    #Close MinGW Installer
    py.hotkey('alt', 'f4')

    if Admin():
        print(os.system(f'setx PATH "%PATH%; C:\\Users\\{username}\\Desktop\\MinGW\\bin" /M'))

    else:
        print(os.system(f'setx PATH "%PATH%; C:\\Users\\{username}\\Desktop\\MinGW\\bin"'))
    
    print(os.system('g++ --version'))

    #DA PROVARE PASSA PASSO