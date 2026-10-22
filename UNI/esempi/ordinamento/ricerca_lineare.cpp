// Ricerca lineare (sequenziale): guarda gli elementi uno alla volta, da
// sinistra a destra, finché trova x oppure finisce l'array.
// Funziona su qualunque array, anche non ordinato.
#include <iostream>
#include <vector>
using namespace std;

//@region lineare
// Indice di x in a; -1 se x non c'è.
int linearSearch(const vector<int>& a, int x) {
    int n = a.size();
    for (int i = 0; i < n; i++) {     //@loop
        if (a[i] == x) {              //@cmp
            return i;                 //@found
        }
    }
    return -1;                        //@notfound
}
//@endregion

int main() {
    vector<int> a = {7, 3, 9, 1, 5, 8};
    cout << "cerco 7: indice " << linearSearch(a, 7) << "   (caso migliore: 1 confronto)\n";
    cout << "cerco 5: indice " << linearSearch(a, 5) << '\n';
    cout << "cerco 4: indice " << linearSearch(a, 4) << "  (caso peggiore: 6 confronti)\n";
    return 0;
}
