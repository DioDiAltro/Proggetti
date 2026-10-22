// Zaino frazionario contro zaino 0/1, con gli stessi oggetti del Cormen.
// Frazionario: il greedy per valore/peso decrescente è ottimo.
// 0/1 (ogni oggetto tutto o niente): lo stesso greedy può sbagliare.
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

struct Oggetto {
    int peso, valore;
};

// ordina per valore/peso decrescente; v1/p1 > v2/p2 equivale a v1*p2 > v2*p1
// (si confrontano interi: niente divisioni e niente errori di arrotondamento)
void ordinaPerRapporto(vector<Oggetto>& ogg) {
    sort(ogg.begin(), ogg.end(), [](const Oggetto& a, const Oggetto& b) {
        return a.valore * b.peso > b.valore * a.peso;
    });
}

//@region frazionario
double zainoFrazionario(vector<Oggetto> ogg, int W) {
    ordinaPerRapporto(ogg);
    double totale = 0;
    int spazio = W;                                   // capacità rimasta
    for (const Oggetto& o : ogg) {
        if (spazio == 0) break;
        if (o.peso <= spazio) {                       // ci sta tutto: lo prendo
            totale += o.valore;
            spazio -= o.peso;
        } else {                                      // ne prendo solo una parte
            totale += o.valore * (double)spazio / o.peso;
            spazio = 0;
        }
    }
    return totale;
}
//@endregion

// lo stesso greedy, ma senza frazioni: un oggetto si prende intero o niente
int zaino01Greedy(vector<Oggetto> ogg, int W) {
    ordinaPerRapporto(ogg);
    int totale = 0, spazio = W;
    for (const Oggetto& o : ogg)
        if (o.peso <= spazio) {
            totale += o.valore;
            spazio -= o.peso;
        }
    return totale;
}

// l'ottimo dello zaino 0/1 provando tutti i 2^n sottoinsiemi (solo per n piccolo)
int zaino01Forza(const vector<Oggetto>& ogg, int W) {
    int n = ogg.size(), migliore = 0;
    for (int s = 0; s < (1 << n); s++) {
        int peso = 0, valore = 0;
        for (int i = 0; i < n; i++)
            if (s & (1 << i)) {
                peso += ogg[i].peso;
                valore += ogg[i].valore;
            }
        if (peso <= W) migliore = max(migliore, valore);
    }
    return migliore;
}

int main() {
    vector<Oggetto> ogg = {{10, 60}, {20, 100}, {30, 120}};   // rapporti 6, 5, 4
    int W = 50;
    cout << "Zaino frazionario, greedy:  " << zainoFrazionario(ogg, W) << '\n';
    cout << "Zaino 0/1, greedy:          " << zaino01Greedy(ogg, W) << '\n';
    cout << "Zaino 0/1, ottimo:          " << zaino01Forza(ogg, W) << '\n';
    return 0;
}
