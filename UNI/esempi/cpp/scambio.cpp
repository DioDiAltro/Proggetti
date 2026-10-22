// Passaggio per valore e per riferimento: due funzioni "scambia" quasi
// identiche. Solo quella con i riferimenti scambia davvero a e b.
#include <iostream>
using namespace std;

//@region tutto
// x e y sono COPIE di a e b
void scambiaValore(int x, int y) {
    int tmp = x;                                //@v-tmp
    x = y;                                      //@v-x
    y = tmp;                                    //@v-y
}                                               //@v-end

// x e y sono ALTRI NOMI di a e b
void scambiaRiferimento(int& x, int& y) {
    int tmp = x;                                //@r-tmp
    x = y;                                      //@r-x
    y = tmp;                                    //@r-y
}                                               //@r-end

int main() {
    int a = 3, b = 5;                           //@m-init
    scambiaValore(a, b);                        //@m-val
    cout << "a = " << a << ", b = " << b << '\n';   //@m-print1
    scambiaRiferimento(a, b);                   //@m-rif
    cout << "a = " << a << ", b = " << b << '\n';   //@m-print2
    return 0;                                   //@m-ret
}
//@endregion
