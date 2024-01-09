import subprocess
import webbrowser
import time

'''
#Chiude senza creare nessun file
if 'chrome.exe' in subprocess.check_output('cmd /c tasklist', shell=True, text=True):
    subprocess.run('taskkill /f /im chrome.exe', shell=True)
    print('Coglione')

else: 
    print('Fortunato')

'''

'''
# Salva l'output in un file di testo
# Esegui il comando nel prompt dei comandi e cattura l'output
output = subprocess.check_output('cmd /c tasklist', shell=True, text=True)
nome=input('Inserisci come si vuole chiamare il file: ')
nome+='.txt'
with open(nome, 'w') as file:
    file.write(output)
    

with open(nome, 'r') as file:
    if 'chrome.exe' in file.read():
        subprocess.run('taskkill /f /im chrome.exe', shell=True)
        print('Coglione')

    else: 
        print('Fortunato')
'''

'''
#Spegne il sistema 
subprocess.run('shutdown /s /t 4', shell=True, text=True)
time.sleep(3)
print('3')
time.sleep(2)
print('2')
time.sleep(1)
print('1')
time.sleep(0)
print('0, Gay')
'''

'''
#Apre il motore di ricerca e scrive
def search(query):
    url = f"https://www.google.com/search?q={query}"
    webbrowser.open(url)

search("xvideos")
'''