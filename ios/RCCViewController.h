#import <UIKit/UIKit.h>
#import "RCTBridge.h"

@interface RCCViewController : UIViewController

@property (nonatomic) NSMutableDictionary *navigatorStyle;
@property (nonatomic) BOOL navBarHidden;

+ (UIViewController*)controllerWithLayout:(NSDictionary *)layout bridge:(RCTBridge *)bridge;

- (instancetype)initWithProps:(NSDictionary *)props
                     children:(NSArray *)children
                       bridge:(RCTBridge *)bridge;

- (instancetype)initWithComponent:(NSString *)component
                        passProps:(NSDictionary *)passProps
                   navigatorStyle:(NSDictionary*)navigatorStyle
                           bridge:(RCTBridge *)bridge;

- (void)performAction:(NSString*)performAction
         actionParams:(NSDictionary*)actionParams
               bridge:(RCTBridge *)bridge
             resolver:(RCTPromiseResolveBlock)resolve
             rejecter:(RCTPromiseRejectBlock)reject;

- (void)setStyleOnAppear;

- (void)setStyleOnInit;

@end
