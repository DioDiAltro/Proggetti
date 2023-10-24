import pyautogui as py, os, ctypes

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

def Move(t, x):
    py.sleep(t)
    py.press('tab', presses=x)
    py.press('enter')

def Admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin() == 0
    
    except:
        return False

if __name__ == '__main__':
    folder_path = Folder()
    url = 'https://sourceforge.net/projects/mingw/'
    username = os.getlogin()

    # #Open chrome on MinGW Site
    # os.system(f'start chrome {url}')
    
    #Click download
    # Move(5, 22)

    #Wait download MinGW and open
    # py.sleep(60+5)
    # os.chdir(f'C:/Users/{username}/Downloads')
    # os.system('start mingw-get-setup')

    #click install 
    # Move(2, 0)

    py.sleep(2)
    if Admin():
        #click change
        Move(2, 3)

        #change dir
        py.press('tab')
        py.sleep(0.5)
        py.hotkey('ctrl', 'a')
        py.sleep(0.5)
        py.press('delete')
        py.sleep(0.5)
        py.typewrite(folder_path)
        py.press('enter')

    #click continue
    Move(1, 0)

    #wait and click continue
    Move(120, 0)
    #CAPIRE COME FARE PER IL MANAGER INSTALLER
    # #MinGW Installer
    # #clic g++
    # X, Y = 514, 385
    # Move(2, X, Y)

    # #mark g++
    # X, Y = 587, 431
    # Move(2, X, Y)

    # #install
    # X, Y = 247, 244
    # Move(2, X, Y)

    # #apply change
    # X, Y = 284, 332
    # Move(2, X, Y)

    # #apply
    # X, Y = 697, 379
    # Move(2, X, Y)

    # #close
    # X, Y = 935, 377
    # Move(300, X, Y)

    # #close MinGW Installer
    # py.hotkey('alt', 'f4')

    # if Admin():
    #     print(os.system(f'setx PATH "%PATH%; C:\\Users\\{username}\\Desktop\\MinGW\\bin" /M'))

    # else:
    #     print(os.system(f'setx PATH "%PATH%; C:\\Users\\{username}\\Desktop\\MinGW\\bin"'))
    
    # print(os.system('g++ --version'))