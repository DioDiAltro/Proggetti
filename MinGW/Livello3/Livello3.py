import pyautogui as py
import os
import ctypes 
import platform 
import pygetwindow as gw
import cv2

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
    system = platform.system()

    if system == 'Windows':
        print('Windows,', end=' ')

        try:
            return ctypes.windll.shell32.IsUserAnAdmin() == 0
    
        except:
            return False
        
    elif system == 'Linux' or system == 'macOS':
        if system == 'Linux':
            print('Linux,', end=' ')

        else:
            print('macOS,', end=' ')

        try:
            return os.geteuid() == 0

        except:
            return False
        
if __name__ == '__main__':
    folder_path = Folder()
    url = 'https://sourceforge.net/projects/mingw/'
    username = os.getlogin()

    #Open chrome on MinGW Site
    os.system(f'start chrome {url}')
        