// Tabella hash a indirizzamento aperto con scansione lineare:
// la chiave k si cerca nelle caselle h(k), h(k)+1, h(k)+2, ... (modulo m).
// Chiavi intere >= 0: i valori negativi segnano le caselle libere.
#include <iostream>
#include <vector>
using namespace std;

//@region tabella
const int VUOTO = -1;        // casella mai usata: qui una ricerca si ferma
const int CANCELLATO = -2;   // casella liberata (tombstone): la ricerca prosegue

class TabellaAperta {
    int m;            // numero di caselle
    vector<int> t;    // t[i] = chiave, VUOTO oppure CANCELLATO
    int n = 0;        // chiavi presenti

    int h(int k) const { return k % m; }

public:
    explicit TabellaAperta(int m) : m(m), t(m, VUOTO) {}

    int cerca(int k) const {                       // indice di k, oppure -1
        for (int j = 0; j < m; j++) {
            int i = (h(k) + j) % m;                //@s-i
            if (t[i] == VUOTO) return -1;          //@s-empty
            if (t[i] == k) return i;               //@s-found
        }                                          // CANCELLATO o altra chiave: avanti
        return -1;                                 //@s-full
    }

    bool inserisci(int k) {
        if (cerca(k) != -1) return false;          //@i-check
        for (int j = 0; j < m; j++) {
            int i = (h(k) + j) % m;                //@i-i
            if (t[i] == VUOTO || t[i] == CANCELLATO) {   //@i-free
                t[i] = k;                          //@i-put
                n++;
                return true;                       //@i-ok
            }
        }
        return false;                              //@i-full
    }

    bool cancella(int k) {
        int i = cerca(k);                          //@d-find
        if (i == -1) return false;                 //@d-miss
        t[i] = CANCELLATO;                         //@d-mark
        n--;
        return true;                               //@d-ok
    }

    double fattoreDiCarico() const { return double(n) / m; }

    void stampa() const {
        for (int i = 0; i < m; i++) {
            cout << i << ": ";
            if (t[i] == VUOTO) cout << "-";
            else if (t[i] == CANCELLATO) cout << "CANCELLATO";
            else cout << t[i];
            cout << '\n';
        }
    }
};
//@endregion

int main() {
    TabellaAperta T(7);
    int chiavi[] = {10, 17, 24, 5};
    for (int k : chiavi) T.inserisci(k);    // 17 e 24 collidono con 10
    T.stampa();

    T.cancella(17);                         // lascia una tombstone
    cout << "cerca(24) -> casella " << T.cerca(24) << '\n';   // la ricerca supera la tombstone
    T.inserisci(31);                        // h(31) = 3: riusa la casella cancellata
    T.stampa();
    cout << "alfa = " << T.fattoreDiCarico() << '\n';
    return 0;
}
