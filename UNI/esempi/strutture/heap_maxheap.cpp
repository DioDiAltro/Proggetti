// Max-heap in un vector, con indici da 0: inserimento con risalita
// (sift-up) ed estrazione del massimo con discesa (sift-down).
#include <iostream>
#include <vector>
using namespace std;

//@region indici
// Indici da 0. Nei libri, con indici da 1:
// padre i/2, figli 2i e 2i+1.
int padre(int i) { return (i - 1) / 2; }
int sinistro(int i) { return 2 * i + 1; }
int destro(int i) { return 2 * i + 2; }
//@endregion

//@region siftup
// a[i] sale finché è più grande del padre.
void siftUp(vector<int>& a, int i) {
    while (i > 0 && a[padre(i)] < a[i]) {  //@up-cmp
        swap(a[padre(i)], a[i]);           //@up-swap
        i = padre(i);                      //@up-move
    }
}

void inserisci(vector<int>& a, int x) {
    a.push_back(x);                        //@ins-push
    siftUp(a, a.size() - 1);               //@ins-up
}
//@endregion

//@region siftdown
// a[i] scende finché è più piccolo di un figlio.
// Usa solo a[0..n-1]: n = dimensione dell'heap.
void siftDown(vector<int>& a, int i, int n) {
    while (sinistro(i) < n) {              //@down-loop
        int m = sinistro(i), r = destro(i);    //@down-kids
        if (r < n && a[r] > a[m]) m = r;   //@down-max
        if (a[i] >= a[m]) return;          //@down-stop
        swap(a[i], a[m]);                  //@down-swap
        i = m;                             //@down-move
    }
}

int estraiMax(vector<int>& a) {   // a non vuoto
    int massimo = a[0];                    //@ext-max
    a[0] = a.back();                       //@ext-last
    a.pop_back();                          //@ext-pop
    siftDown(a, 0, a.size());              //@ext-down
    return massimo;                        //@ext-ret
}
//@endregion

bool eHeap(const vector<int>& a) {         // proprietà del max-heap
    for (int i = 1; i < (int)a.size(); i++)
        if (a[padre(i)] < a[i]) return false;
    return true;
}

void stampa(const char* titolo, const vector<int>& a) {
    cout << titolo;
    for (int x : a) cout << ' ' << x;
    cout << (eHeap(a) ? "   (max-heap)" : "   (non è un heap)") << '\n';
}

int main() {
    vector<int> a;
    for (int x : {13, 5, 17, 4, 2, 25, 8, 20})
        inserisci(a, x);
    stampa("dopo 8 inserimenti:", a);

    inserisci(a, 30);
    stampa("dopo inserisci(30):", a);

    for (int k = 0; k < 3; k++) {
        int m = estraiMax(a);
        cout << "estraiMax() = " << m << '\n';
        stampa("  heap:", a);
    }
    return 0;
}
