// Ricostruire un albero binario dalla visita in preordine e dalla visita
// simmetrica (le chiavi devono essere tutte diverse).
#include <iostream>
#include <vector>
using namespace std;

struct Nodo {
    int key;
    Nodo* left;
    Nodo* right;
    Nodo(int k) : key(k), left(nullptr), right(nullptr) {}
};

//@region costruisci
// Costruisce il sottoalbero che nella simmetrica occupa in[lo..hi].
// p è la posizione in pre della prossima radice: avanza a ogni nodo creato.
Nodo* costruisci(const vector<int>& pre, const vector<int>& in, int& p, int lo, int hi) {
    if (lo > hi) return nullptr;                        //@rc-base
    Nodo* t = new Nodo(pre[p]);                         //@rc-root
    p++;                                                //@rc-next
    int k = lo;                                         //@rc-k
    while (in[k] != t->key) k++;                        //@rc-find
    t->left = costruisci(pre, in, p, lo, k - 1);        //@rc-left
    t->right = costruisci(pre, in, p, k + 1, hi);       //@rc-right
    return t;                                           //@rc-ret
}
//@endregion

void postorder(Nodo* t) {
    if (t == nullptr) return;
    postorder(t->left);
    postorder(t->right);
    cout << t->key << ' ';
}

void distruggi(Nodo* t) {
    if (t == nullptr) return;
    distruggi(t->left);
    distruggi(t->right);
    delete t;
}

int main() {
    vector<int> pre = {10, 4, 2, 9, 1, 8, 7, 5};
    vector<int> in = {2, 4, 1, 9, 8, 10, 7, 5};
    int p = 0;
    Nodo* radice = costruisci(pre, in, p, 0, (int)in.size() - 1);

    // Il postordine dell'albero ricostruito: se coincide con quello
    // dell'albero di partenza, la ricostruzione è giusta.
    cout << "radice: " << radice->key << '\n';
    cout << "postordine: ";
    postorder(radice);
    cout << '\n';

    distruggi(radice);
    return 0;
}
