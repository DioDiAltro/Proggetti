// Un vector fatto a mano: quando l'array è pieno se ne alloca uno grande il
// doppio e ci si copiano gli elementi. Contando le copie si vede che n
// push_back costano in tutto meno di 3n operazioni.
#include <iostream>
#include <vector>
using namespace std;

//@region vettore
struct Vettore {
    int* dati = nullptr;    // array sullo heap
    int n = 0;              // elementi usati (size)
    int cap = 0;            // posti disponibili (capacity)

    void push_back(int x) {
        if (n == cap) {                                 //@pieno
            int nuovaCap = (cap == 0) ? 1 : 2 * cap;    //@nuovacap
            int* nuovi = new int[nuovaCap];             //@alloca
            for (int i = 0; i < n; i++)                 //@ciclo
                nuovi[i] = dati[i];                     //@copia
            delete[] dati;                              //@libera
            dati = nuovi;                               //@sposta
            cap = nuovaCap;                             //@cap
        }
        dati[n] = x;                                    //@scrivi
        n++;                                            //@inc
    }

    ~Vettore() { delete[] dati; }
};
//@endregion

int main() {
    Vettore v;
    long long copie = 0;
    for (int i = 1; i <= 1000; i++) {
        int capPrima = v.cap;
        v.push_back(10 * i);
        if (v.cap != capPrima) {            // c'è stata una riallocazione:
            copie += capPrima;              // sono stati copiati capPrima elementi
            if (i <= 33)
                cout << "push_back n. " << i << ": capacity " << capPrima << " -> " << v.cap
                     << ", copiati " << capPrima << '\n';
        }
    }
    cout << "dopo 1000 push_back: capacity " << v.cap << ", copie " << copie
         << ", costo totale " << 1000 + copie << " <= 3n = 3000\n";

    vector<int> w;                          // il vector vero di g++ raddoppia anche lui
    size_t ultima = w.capacity();
    cout << "std::vector, capacity:";
    for (int i = 1; i <= 100; i++) {
        w.push_back(i);
        if (w.capacity() != ultima) {
            ultima = w.capacity();
            cout << ' ' << ultima;
        }
    }
    cout << '\n';
    return 0;
}
