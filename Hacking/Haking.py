import subprocess

# Esegui il comando nel prompt dei comandi e cattura l'output
output = subprocess.check_output('cmd /c tasklist', shell=True, text=True)
'''
#Chiude senza creare nessun file
if 'chrome.exe' in output:
    subprocess.run('taskkill /f /im chrome.exe', shell=True)
    print('Coglione')

else: 
    print('Fortunato')
'''

'''
# Salva l'output in un file di testo
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