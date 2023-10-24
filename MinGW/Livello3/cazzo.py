import cv2
import pyautogui as py
from PIL import Image
import numpy as np

image_path = "Livello3\\Chrome.png"  # Specifica il percorso dell'immagine

try:
    reference_image_pil = Image.open(image_path)
    print("L'immagine è valida.")

    # Carica l'immagine di riferimento (l'icona di un file PDF) con OpenCV
    reference_image_cv2 = cv2.imread(image_path)

    while True:
        # Cattura uno screenshot dello schermo
        screenshot_pil = py.screenshot()

        # Converte lo screenshot di PIL in un array numpy
        screenshot_np = np.array(screenshot_pil)

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

except Exception as e:
    print(f"Errore nell'apertura dell'immagine: {str(e)}")
