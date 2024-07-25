from random import randint, choice
from os import system

SCHEMA = '{}HP  |  {}€  |  {}🎯   |    {}'

indice = 0

PLAY_OPZ = (

'AZIONI DISPONIBILI:',

'''
1) ATTACCA
2) SCAPPA
3) FAI AMICIZIA    \n
'''

)

EVENTI_CASUALI = (

#prima LUOGHI poi CRISTIANI
        (
            ''' 
dietro a un {}, trovi tre {} nudi che si schiaffeggiano il pesce con un rametto.
ti viene una botta di rabbia e smonti uno di loro con un calcio volante!!
cristo! gli altri due coglioni nudi cacciano dei tirapugni dal culo!!

''',
            '''
mentre cammini per un {}, diversi {} si alzano da terra e ti guardano
con teneri occhi lucidi.

''',
            '''
mentre pisciavi su un albero vicino a un {}, senti avvicinarsi due {}
che corrono velocissimo. uno di loro azzoppa vola e
finisce di faccia sull'albero pisciato. così ti sgamano.

''',
            '''
ti aggiri per un {}, e a una certa, senti dei rumori strani.
Sono tre {} che parteciano a un'orgia clandestina!

''',
            '''
una giga puzza di merda invade un {} e qualche senti due {}:
"fanculo!!! fanculo!!! fanculo!!!" "scorreggione figlio di puttana!!!"
'''
        ),

#prima CRISTIANI poi LUOGHI
        (
            ''' 
wow! un famoso trio di {} se la fa con diversi anziani gay in un {}.
a quanto pare non vogliono che si sappia, e ti hanno appena visto!
''',
            ''' 
ops... vai a diarrea dietro un cespuglio, ma ti ritrovi difronte due {}
proventi da un {}, e stai pure col culo cacato!
''',
            ''' 
ma che cazzo... due {} hanno appena ucciso di botte due disabili
dietro un {}. per sbaglio squacci a terra e ti notano.
''',
            '''
non ce la fai più... tieni troppo a cacare, e intravedi tue {} che fanno
l'elemosina difronte un {}. ti sei tolto lo sfizio cacando nel cappello
che aveva in mano. non gli piace e inizia a strizzare il berretto mentre urla!
'''
        ),


#solo CRISTIANI
        (
            '''
mentre cammini per un altura, decidi che sdiarreare da 100m di altezza spacca.
i due {} sotto al precipizio non la prendono bene\ne, saltando molto in alto, ti raggiungono.
''',
            '''
vicino ad un bar esce un nero che corre velocissimo con tante scarpe in mano.
te le butta tutte addosso e, dato che sei nero, ora hai 6-7 {} che ti odiano.
''',
            '''
sei in un bosco nel chill, scacazzi a terra. poi ti giri e non c'è niente a terra.
due {} ninja hanno mangiato la merda e si sono nascosti tra gli alberi!            
'''
        )
)

CRISTIANI = ('negri','anziani','ricchioni','ciccioni','analfabeti','attivisti','contabili','bambini','gnomi','nani','antichi pompieri')
LUOGHI = ('villaggio','bosco','sotterraneo','ponte','posto di merda','mausoleo','fiume','bronx')

FINALI_CASUALI = (
    
# finali attacco
    (
        # finale buono
        ('uno ti ha lanciato la scarpa a fanculo e lo hai risposto con un pompino istantaneo',
         'mentre uno piangeva, hai performato un perfetto calcio volante\nche ha fatto piangere anche gli amici.',
         'hai ucciso uno di loro e gli altri sono saliti su dei monopattini d\'argento e \nsi sono sparati in aria, scomparendo.'),

        # finale cattivo
        ('dannazione! uno di loro inizia a urlare fortissimo e ti squaccia a terra!!!',
         'quello con la mutanda sgommata è molto più serio di quanto sembri!!\nti ha rotto il culo e sei scappato!',
         'stavi palesemente per ucciderne uno, ma purtroppo sdiarrei sul momento e ti picchiano.')   

    ),

# finali amicizia
    (
        # finale buono
        ('gli hai offerto una sigasmokes e un bambino ti ha spompinato, evviva!',
         'dicono che per stare con loro devi metterti un mandarino nel culo.\n ora stai con loro.'),

        # finale cattivo
        ('sei molto timido e mentre parli per sbaglio caghi in piedi.\nti hanno picchiato molto forte.',
         'ti hanno incaricato di rollare la giga J ma ti cade il dildo dal culo. tutti ti iniziano a picchiare fortissimo!\n\n',
         'mentre parli accendi il telefono di legno e parte un porno furry gay.\nti fanno giustizia.')
   
    ),


# finali scappare
    (
        # finale buono
        ('scatti a correre veloce, ma uno di loro è incredibilmente fast. wow! che culo! è caduto e si è rotto i denti!',
         'sei fortunato che la maggior parte di loro è composta da ciotti.',
         'uno ti ha stracciato e strappato la tasca del pantalone. glie l\'hai messa in bocca e sei scappato'),
        
        # finale cattivo
        ('stavi per scappare, ma con un\'abile mossa un tuo avversario ti straccia tutta la maglietta!',
         'mannaggia! mannaggia! ti hanno raggiunto e rubato le scarpe!!!',
         'non dovevi fermarti a pisciare dopo 8 secondi di corsa. ti hanno strappato parte dei capelli.',
         'ma che cazzo !? uno è proprio veloce! oh! è incredibilmente fast!!!\nti ha stracciato il berretto così forte da bucartelo')
    
    )

)


class Arma:

    # la durata dell'arma quando inizializzata è sempre a 100. dovrebbe scendere e non rimanere a 100 dato che si inizializza all'inizio appunto
    def __init__(self, nome, luck, durata=100) -> None:
        self.__nome = nome
        self.__luck = luck
        self.__durata = durata

    def getNome(self):
        return self.__nome
    
    def getLuck(self):
        return self.__luck
    
    @property
    def Durata(self):
        return self.__durata
  
    @Durata.setter
    def Durata(self, value):
        self.__durata = value  

        if self.__durata <= 0:
            self.__nome = None
            self.__luck = None
            self.__durata = None

            PLAYER.setArma(None)


            print('Ti si è smontata l\'arma in mano!')

ARMI = (
    Arma('BASTONCINO', 4),
    Arma('FIONDA DI MERDA', 8),
    Arma('MAZZA', 12),
    Arma('COLTELLONE', 15),
    Arma('GIGA_AXE', 18),
    Arma('PYSTOLS', 22),
    Arma('SPUTAFIAMME', 25),
    Arma('FUCILS', 25)

)


class Player:
    def __init__(self, nome) -> None:
        self.__nome = nome
        self.__hp = 100
        self.__money = 50
        self.__score = 0
        self.__inventario = []
        self.__arma = ARMI[0]

    def getNome(self):
        return self.__nome
    
    def getHp(self):
        return self.__hp
    
    def getMoney(self):
        return self.__money
    
    def getScore(self):
        return self.__score
    
    def getInventario(self):
        return self.__inventario
    
    def addInventario(self, item):
        self.inventario__.append(item)

    def rmInventario(self, item):
        self.__inventario.remove(item)

    def getArma(self):
        return self.__arma
    
    def setArma(self, arma):
        self.__arma = arma

    def win(self, hp, money, score):
        self.__hp += hp
        self.__money += money
        self.__score += score

    def lose(self, hp, money, score):
        self.__hp -= hp
        self.__money -= money
        self.__score += score


PLAYER = Player(input('Inserisci il tuo nome: '))

def events():

    # il tipo evento è necessario per il .format() degli avvenimenti. 
    tipo_evento = randint(0,2)

    if tipo_evento == 0:
        #wow!
        print(choice(EVENTI_CASUALI[tipo_evento]).format(choice(LUOGHI), choice(CRISTIANI)))
        
    elif tipo_evento == 1:
        #e funziona eh!!
        print(choice(EVENTI_CASUALI[tipo_evento]).format(choice(CRISTIANI), choice(LUOGHI)))

    elif tipo_evento == 2:
        print(choice(EVENTI_CASUALI[tipo_evento]).format(choice(CRISTIANI)))


def destino(num):

    prob = randint(22,40)

    if num == 1:
        if PLAYER.getArma() == None:
            prob -= 10

        else:
            prob += PLAYER.getArma().getLuck()
        
        if PLAYER.getHp() >= 70:
            prob += 4
        
        for i in PLAYER.getInventario():
            prob -= 2


    elif num == 2:
        for i in PLAYER.getInventario():
            prob -= 4

        if PLAYER.getArma() == None:
            prob += 8

        if PLAYER.getHp() <= 30:
            prob -= 4


    elif num == 3:
        for i in PLAYER.getInventario():
            prob += 4

        if PLAYER.getArma().getLuck() >= 18:
            prob -= 4


    if prob < randint(0,100):

        if num == 1:
            print(choice(FINALI_CASUALI[0][1]))

        elif num == 2:
            print(choice(FINALI_CASUALI[1][1]))

        elif num == 3:
            print(choice(FINALI_CASUALI[2][1]))

        lost_points = [randint(5,15), randint(5,15), randint(10,15)]

        PLAYER.lose(lost_points[0], lost_points[1], lost_points[2])

        print(f'\n-{lost_points[0]}HP   -{lost_points[1]}€    +{lost_points[2]}🎯')

    else:
        if num == 1:
            print(choice(FINALI_CASUALI[0][0]))

        elif num == 2:
            print(choice(FINALI_CASUALI[1][0]))

        elif num == 3:
            print(choice(FINALI_CASUALI[2][0]))

        get_points = [randint(5,11), randint(5,15), randint(20,30)]

        PLAYER.win(get_points[0], get_points[1], get_points[2])

        print(f'\n+{get_points[0]}HP   +{get_points[1]}€    +{get_points[2]}🎯')




def scelta(mode='casual'):

    if mode == 'casual':

        while True:

            try:
                choose = int(input(PLAY_OPZ[0] + PLAY_OPZ[1]))

                assert choose in [1,2,3]

            except:
                print('fanculo. riprova')

            else:
                system('cls') # system('clear')
                break
    
    elif mode == 'inizio':
        pass

    return choose
        

def run():

    global indice


    while PLAYER.getHp() > 0:

        system('cls') # system('clear')
    
        print(SCHEMA.format(PLAYER.getHp(), PLAYER.getMoney(), PLAYER.getScore(), 'No Weapon. Accort' if PLAYER.getArma() is None else PLAYER.getArma().getNome()))

        indice += 1

        # qua sta la storia principale se la vogliamo fare
        if indice in []:
            pass

        else:
            events()        
            destino(scelta())
            input("\nPremi Invio per continuare...")

    else:
        print('GAME OVER')


    

if __name__ == '__main__':

    system('cls') # system('clear')
    run()

else:
    print('game.py is not a importable module')