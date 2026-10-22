// Tabella hash con liste di trabocco (chaining): t[i] è la testa della
// lista con tutte le chiavi k che hanno h(k) = i. Chiavi intere >= 0.
#include <iostream>
#include <vector>
using namespace std;

//@region tabella
struct Nodo {
    int chiave;
    Nodo* next;
};

class TabellaHash {
    int m;                 // numero di liste (caselle)
    vector<Nodo*> t;       // t[i] = primo nodo della lista i
    int n = 0;             // chiavi presenti

    int h(int k) const { return k % m; }

public:
    explicit TabellaHash(int m) : m(m), t(m, nullptr) {}
    ~TabellaHash() {
        for (Nodo* p : t)
            while (p != nullptr) {
                Nodo* succ = p->next;
                delete p;
                p = succ;
            }
    }
    TabellaHash(const TabellaHash&) = delete;
    TabellaHash& operator=(const TabellaHash&) = delete;

    bool cerca(int k) const {
        int i = h(k);                                   //@s-h
        for (Nodo* p = t[i]; p != nullptr; p = p->next) //@s-loop
            if (p->chiave == k) return true;            //@s-cmp
        return false;                                   //@s-miss
    }

    bool inserisci(int k) {
        if (cerca(k)) return false;                     //@i-check
        int i = h(k);                                   //@i-h
        t[i] = new Nodo{k, t[i]};                       //@i-new
        n++;
        return true;                                    //@i-ok
    }

    bool cancella(int k) {
        int i = h(k);                                   //@d-h
        Nodo* prev = nullptr;
        Nodo* p = t[i];                                 //@d-init
        while (p != nullptr && p->chiave != k) {        //@d-loop
            prev = p;
            p = p->next;                                //@d-adv
        }
        if (p == nullptr) return false;                 //@d-miss
        if (prev == nullptr) t[i] = p->next;            //@d-head
        else prev->next = p->next;                      //@d-link
        delete p;                                       //@d-del
        n--;
        return true;                                    //@d-ok
    }

    double fattoreDiCarico() const { return double(n) / m; }   // α = n / m

    void stampa() const {
        for (int i = 0; i < m; i++) {
            cout << i << ":";
            for (Nodo* p = t[i]; p != nullptr; p = p->next) cout << " -> " << p->chiave;
            cout << '\n';
        }
    }
};
//@endregion

int main() {
    TabellaHash T(7);
    int chiavi[] = {10, 17, 24, 5, 15};
    for (int k : chiavi) T.inserisci(k);
    T.stampa();
    cout << "alfa = " << T.fattoreDiCarico() << '\n';

    cout << boolalpha;
    cout << "cerca(31): " << T.cerca(31) << '\n';
    cout << "cancella(17): " << T.cancella(17) << '\n';
    cout << "cerca(24): " << T.cerca(24) << '\n';
    T.inserisci(31);
    T.stampa();
    return 0;
}
