import webbrowser
import pyautogui as py
import cv2
import numpy as np
import pygetwindow as gw

def WebSite(t):
    webbrowser.open(t)



def SetUp():
    # reference_image = cv2.imread('Image\\Download.png')
    # Win = webbrowser.get()
    # window = gw.getWindowsWithTitle(Win)[0]

    # window.activate()

    # X, Y, W, H = window.left, window.top, window.width, window.height

    # img = py.screenshot(region = (X, Y, W, H))

    # np_img = np.array(img)

    # cv2_np_img = cv2.cvtColor(np_img, cv2.COLOR_RGB2BGR)
    
    # while True:
    #     result = cv2.matchTemplate(cv2_np_img, reference_image, cv2.TM_CCOEFF_NORMED)

    #     min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

    #     if max_val > 0.9:  
    #         x, y = max_loc

    #         py.click(x, y)

    #         break

    print('Setup ok')

def Manager():
    print('Manager ok')

def Mark():
    print('Mark ok')

def Install():
    print('Install ok')

def Path():
    print('Path ok')