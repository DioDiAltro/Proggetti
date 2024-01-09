import cv2
import pyautogui as py
from PIL import Image
import numpy as np
import pygetwindow as gw

image_path = "Livello3\\Download.png"  # Specifica il percorso dell'immagine

# Carica l'immagine di riferimento (l'icona di un file PDF) con OpenCV
reference_image_cv2 = cv2.imread(image_path)
window = gw.getWindowsWithTitle('Google Chrome')

window = window[0]
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
        py.click(x, y)
        break