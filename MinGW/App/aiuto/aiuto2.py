from screenshot import getScreenshot
import cv2, os


title = "MinGW Installation Manager"

Screen = getScreenshot(title)

if Screen is None:
    print("Dio")

else:
    print(Screen)