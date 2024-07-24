import random

schema = '{}HP    {}€    {}🎯       {}'

indice = 0

eventi_casuali = (

#prima luoghi poi cristiani
        (
            ''' 
dietro a un {}, trovi tre {} nudi che si schiaffeggiano il pesce con un rametto.\n
ti viene una botta di rabbia e smonti uno di loro con un calcio volante!!\n
cristo! gli altri due coglioni nudi cacciano dei tirapugni dal culo!!
            ''',
            '''
mentre cammini per un {}, diversi {} si alzano da terra e ti guardano\n
con teneri occhi lucidi.
            ''',
            '''
mentre pisciavi su un albero vicino a un {}, senti avvicinarsi due {}\n
che corrono velocissimo. uno di loro azzoppa vola e \n
finisce di faccia sull'albero pisciato. così ti sgamano.
            ''',
            '''
ti aggiri per un {}, e a una certa, senti dei rumori strani.\n 
Sono tre {} che parteciano a un'orgia clandestina!
            '''
        ),

#prima cristiani poi luoghi
        (
            ''' 
wow! un famoso trio di {} se la fa con diversi anziani gay in un {}.\n
a quanto pare non vogliono che si sappia, e ti hanno appena visto!

            ''',
            ''' 
ops... vai a diarrea dietro un cespuglio, ma ti ritrovi difronte due {}\n
proventi da un {}, e stai pure col culo cacato!
            ''',
            ''' 
ma che cazzo... due {} hanno appena ucciso di botte due disabili\n
dietro un {}. per sbaglio squacci a terra e ti notano.
            ''',
            '''
non ce la fai più... tieni troppo a cacare, e intravedi tue {} che fanno\n
l'elemosina difronte un {}. ti sei tolto lo sfizio cacando nel cappello\n
che aveva in mano. non gli piace e inizia a strizzare il berretto mentre urla!
            '''
        ),


#solo cristiani
        (
            '''
mentre cammini per un altura, decidi che sdiarreare da 100m di altezza spacca.\n
i due {} sotto al precipizio non la prendono bene\ne, saltando molto in alto, ti raggiungono.
            ''',
            '''
vicino ad un bar esce un nero che corre velocissimo con tante scarpe in mano.\n
te le butta tutte addosso e, dato che sei nero, ora hai 6-7 {} che ti odiano.
            ''',
            '''
sei in un bosco nel chill, scacazzi a terra. poi ti giri e non c'è niente a terra.\n
due {} ninja hanno mangiato la merda e si sono nascosti tra gli alberi!            
            '''
        )
)

cristiani = ('negri','anziani','ricchioni','ciccioni','analfabeti','attivisti','contabili','bambini','gnomi','nani','antichi pompieri')
luoghi = ('villaggio','bosco','sotterraneo','ponte','posto di merda','mausoleo','fiume','bronx')

finali_casuali = (
    
    #finali attacco
    (

        ('uno ti ha lanciato la scarpa a fanculo e lo hai risposto con un pompino istantaneo',
         'mentre uno piangeva, hai performato un perfetto calcio volante\nche ha fatto piangere anche gli amici.',
         'hai ucciso uno di loro e gli altri sono saliti su dei monopattini d\'argento e \nsi sono sparati in aria, scomparendo.'),

        ('dannazione! uno di loro inizia a urlare fortissimo e ti squaccia a terra!!!',
         'quello con la mutanda sgommata è molto più serio di quanto sembri!!\nti ha rotto il culo e sei scappato!',
         'stavi palesemente per ucciderne uno, ma purtroppo sdiarrei sul momento e ti picchiano.')                   
    ),

#finali amicizia
    (
        ('gli hai offerto una sigasmokes e un bambino ti ha spompinato, evviva!',
         'dicono che per stare con loro devi metterti un mandarino nel culo.\n ora stai con loro.'),

        ('sei molto timido e mentre parli per sbaglio caghi in piedi.\nti hanno picchiato molto forte.',
         'ti hanno incaricato di rollare la giga J ma ti cade il dildo dal culo. tutti ti iniziano a picchiare fortissimo!\n\n',
         'mentre parli accendi il telefono di legno e parte un porno furry gay.\nti fanno giustizia.')
    ),


#finali scappare
    (
        ('scatti a correre veloce, ma uno di loro è incredibilmente fast. wow! che culo! è caduto e si è rotto i denti!',
         'sei fortunato che la maggior parte di loro è composta da ciotti.',
         'uno ti ha stracciato e strappato la tasca del pantalone. glie l\'hai messa in bocca e sei scappato'),
        ('stavi per scappare, ma con un\'abile mossa un tuo avversario ti straccia tutta la maglietta!',
         'mannaggia! mannaggia! ti hanno raggiunto e rubato le scarpe!!!',
         'non dovevi fermarti a pisciare dopo 8 secondi di corsa. ti hanno strappato parte dei capelli.',
         'ma che cazzo !? uno è proprio veloce! oh! è incredibilmente fast!!!\nti ha stracciato il berretto così forte da bucartelo')
    )
)


class Arma():

    #la durata dell'arma quando inizializzata è sempre a 100. dovrebbe scendere e non rimanere a 100 dato che si inizializza all'inizio appunto
    def __init__(self, nome, luck, durata=100) -> None:
        self.__nome = nome
        self.__luck = luck
        self.__durata = durata

    def getNome(self):
        return self.__nome
    
    def getLuck(self):
        return self.__luck
    
    def getDurata(self):
        return self.__durata
    
    def setDurata(self, value):
        self.__durata -= value  

        if self.__durata <= 0:
            self.__nome = None
            self.__luck = None
            self.__durata = None

            print('Ti si è smontata l\'arma in mano!')

armi = (
    ['BASTONCINO', 4],
    ['FIONDA DI MERDA', 8],
    ['MAZZA', 12],
    ['COLTELLONE', 15],
    ['GIGA_AXE', 20],
    ['PYSTOLS', 22],
    ['SPUTAFIAMME', 25],
    ['FUCILS', 25]
)

arma = Arma(armi[0][0], armi[0][1])

class Player():
    def __init__(self) -> None:
        self.__hp = 100
        self.__money = 50
        self.__score = 0
        self.__inventario = []

    def getHp(self):
        return self.__hp
    
    def getMoney(self):
        return self.__money
    
    def getScore(self):
        return self.__score
    
    def getInventario(self):
        return self.__inventario
    
    def addInventario(self, item):
        self.__inventario.append(item)

    def rmInventario(self, item):
        self.__inventario.remove(item)

    def win(self, hp, money, score):
        self.__hp += hp
        self.__money += money
        self.__score += score

    def lose(self, hp, money, score):
        self.__hp -= hp
        self.__money -= money
        self.__score += score


player = Player()

def events(contatore=0):

    if contatore == 0:


        #il tipo evento è necessario per il .format() degli avvenimenti. 
        tipo_evento = random.randint(0,1)

        if tipo_evento == 0:

            #wow!
            print(random.choice(eventi_casuali[tipo_evento]).format(random.choice(luoghi), random.choice(cristiani)))

        elif tipo_evento == 1:
            
            #e funziona eh!!
            print(random.choice(eventi_casuali[tipo_evento]).format(random.choice(cristiani), random.choice(luoghi)))

        elif tipo_evento == 2:
            pass

def run():

    global indice

    if Arma.getNome == None:
        print(schema.format(player.getHp(), player.getMoney(), player.getScore(), 'No Weapon. Accort'))
    
    else:
        print(schema.format(player.getHp(), player.getMoney(), player.getScore(), arma.getNome()))

    indice += 1

    #qua sta la storia principale se la vogliamo fare
    if indice in []:
        pass

    else:
        events()
    

if __name__ == '__main__':
    run()
else:
    print('game.py is not a importable module')