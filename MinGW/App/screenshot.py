import pyautogui as py
import pygetwindow as gw
import numpy as np

def getScreenshot(title):
    Window = gw.getWindowsWithTitle(title)
    
    if not Window:
        return
    
    x, y, width, height = Window[0].left, Window[0].top, Window[0].width, Window[0].height

    Screen = py.screenshot(region=(x, y, width, height))

    Screen_Arr = np.array(Screen)

    return Screen_Arr
    